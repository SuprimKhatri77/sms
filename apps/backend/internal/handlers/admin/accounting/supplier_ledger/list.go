package supplierledger

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

const handlerListSupplierLedger = "ListSupplierLedger"

type ListSupplierLedgerParams struct {
	SupplierID string `form:"supplier_id"`
	FromDate   string `form:"from_date"`
	ToDate     string `form:"to_date"`
}

func ListSupplierLedger(queries accountingRepository.SupplierLedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const PAGE_LIMIT = 40

		var filters ListSupplierLedgerParams
		if err := c.ShouldBindQuery(&filters); err != nil {
			applog.Warn(c, handlerListSupplierLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			applog.Warn(c, handlerListSupplierLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetSupplierLedgerCount(ctx, db.GetSupplierLedgerCountParams{
			SupplierID: utils.ToNullableUUID(filters.SupplierID),
			FromDate:   utils.ToNullableDate(filters.FromDate),
			ToDate:     utils.ToNullableDate(filters.ToDate),
		})
		if err != nil {
			applog.Error(c, handlerListSupplierLedger, "failed to process request",
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
				Data:    []db.ListSupplierLedgerRow{},
				Meta: types.PaginationMeta{
					Total:      0,
					TotalPages: 0,
					Page:       page,
					Limit:      PAGE_LIMIT,
				},
			})
			return
		}

		totalPages := (total + PAGE_LIMIT - 1) / PAGE_LIMIT
		if page > int(totalPages) {
			applog.Warn(c, handlerListSupplierLedger, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter value",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		offset := (page - 1) * PAGE_LIMIT

		supplierLedgers, err := queries.ListSupplierLedger(ctx, db.ListSupplierLedgerParams{
			Limit:      pgtype.Int4{Int32: PAGE_LIMIT, Valid: true},
			Offset:     int32(offset),
			SupplierID: utils.ToNullableUUID(filters.SupplierID),
			FromDate:   utils.ToNullableDate(filters.FromDate),
			ToDate:     utils.ToNullableDate(filters.ToDate),
		})

		if err != nil {
			applog.Error(c, handlerListSupplierLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(supplierLedgers) == 0 {
			supplierLedgers = []db.ListSupplierLedgerRow{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    supplierLedgers,
			Meta: types.PaginationMeta{
				Limit:      PAGE_LIMIT,
				Page:       page,
				Total:      int(total),
				TotalPages: int(totalPages),
			},
		})
	}
}
