package cashledger

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListCashLedger = "ListCashLedger"

type ListCashLedgerParams struct {
	FromAD string `form:"from_ad"`
	ToAD   string `form:"to_ad"`
}

func ListCashLedger(queries accountingRepository.CashLedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const PAGE_LIMIT int64 = 40

		var filter ListCashLedgerParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			applog.Warn(c, handlerListCashLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameters",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			applog.Warn(c, handlerListCashLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetCashLedgerCount(ctx, db.GetCashLedgerCountParams{
			FromDate: utils.ToNullableDate(filter.FromAD),
			ToDate:   utils.ToNullableDate(filter.ToAD),
		})
		if err != nil {
			applog.Error(c, handlerListCashLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if total == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data:    []db.ListBankLedgerRow{},
				Meta: types.PaginationMeta{
					Total:      0,
					TotalPages: 0,
					Limit:      int(PAGE_LIMIT),
					Page:       page,
				},
			})
			return
		}

		totalPages := (total + PAGE_LIMIT - 1) / PAGE_LIMIT
		if page > int(totalPages) {
			applog.Warn(c, handlerListCashLedger, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		offset := PAGE_LIMIT * (int64(page) - 1)

		list, err := queries.ListCashLedger(ctx, db.ListCashLedgerParams{
			Limit:    pgtype.Int4{Int32: int32(PAGE_LIMIT), Valid: true},
			Offset:   int32(offset),
			FromDate: utils.ToNullableDate(filter.FromAD),
			ToDate:   utils.ToNullableDate(filter.ToAD),
		})

		if err != nil {
			applog.Error(c, handlerListCashLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(list) == 0 {
			list = []db.CashLedger{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    list,
			Meta: types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       page,
				Limit:      int(PAGE_LIMIT),
			},
		})

	}
}
