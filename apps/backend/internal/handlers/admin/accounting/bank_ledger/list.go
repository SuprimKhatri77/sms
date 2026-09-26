package bankledger

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

const handlerListBankLedger = "ListBankLedger"

type ListBankLedgerParams struct {
	BankAccountID string `form:"account_id" binding:"omitempty,uuid"`
	BankID        string `form:"bank_id" binding:"omitempty,uuid"`
	FromDate      string `form:"from_date" binding:"omitempty,date_format"`
	ToDate        string `form:"to_date" binding:"omitempty,date_format"`
}

func ListBankLedger(queries accountingRepository.BankLedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const PAGE_LIMIT int64 = 40

		var filter ListBankLedgerParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			applog.Warn(c, handlerListBankLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameters",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		var accountID pgtype.UUID
		if filter.BankAccountID != "" {
			id, err := utils.ConvertToUUID(filter.BankAccountID)
			if err != nil {
				applog.Warn(c, handlerListBankLedger, "invalid request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid account ID format",
					Code:    constants.InvalidIDFormat,
				})
				return
			}
			accountID = id
		}

		var bankID pgtype.UUID
		if filter.BankID != "" {
			id, err := utils.ConvertToUUID(filter.BankID)
			if err != nil {
				applog.Warn(c, handlerListBankLedger, "invalid request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid bank ID format",
					Code:    constants.InvalidIDFormat,
				})
				return
			}
			bankID = id
		}

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			applog.Warn(c, handlerListBankLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return

		}

		total, err := queries.GetBankLedgerCount(ctx, db.GetBankLedgerCountParams{
			BankAccountID: accountID,
			BankID:        bankID,
			FromDate:      utils.ToNullableDate(filter.FromDate),
			ToDate:        utils.ToNullableDate(filter.ToDate),
		})
		if err != nil {
			applog.Error(c, handlerListBankLedger, "failed to process request",
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
			applog.Warn(c, handlerListBankLedger, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		offset := PAGE_LIMIT * (int64(page) - 1)

		list, err := queries.ListBankLedger(ctx, db.ListBankLedgerParams{
			Limit:         pgtype.Int4{Int32: int32(PAGE_LIMIT), Valid: true},
			Offset:        int32(offset),
			BankAccountID: accountID,
			BankID:        bankID,
			FromDate:      utils.ToNullableDate(filter.FromDate),
			ToDate:        utils.ToNullableDate(filter.ToDate),
		})

		if err != nil {
			applog.Error(c, handlerListBankLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(list) == 0 {
			list = []db.ListBankLedgerRow{}
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
