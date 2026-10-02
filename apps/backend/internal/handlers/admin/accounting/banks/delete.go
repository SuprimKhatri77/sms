package banks

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerDeleteBank = "DeleteBank"

func DeleteBank(queries accountingRepository.BankRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		bankIDFromParam := c.Param("bankID")
		if bankIDFromParam == "" {
			applog.Warn(c, handlerDeleteBank, "invalid request",
				slog.String("bankID_raw", bankIDFromParam))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing bank ID",
				Code:    constants.MissingBankID,
			})
			return
		}

		bankID, err := utils.ConvertToUUID(bankIDFromParam)
		if err != nil {
			applog.Warn(c, handlerDeleteBank, "invalid request",
				slog.String("bankID_raw", bankIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return

		}

		bank, err := queries.GetBankByID(ctx, bankID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerDeleteBank, "resource not found",
					slog.String("bankID_raw", bankIDFromParam),
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Bank not found",
					Code:    constants.BankNotFound,
				})
				return
			}
			applog.Error(c, handlerDeleteBank, "failed to process request",
				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if bank.IsDefault {
			applog.Warn(c, handlerDeleteBank, "conflict")
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "Cannot delete default bank. Set another bank as default first.",
				Code:    constants.CannotDeleteDefaultBank,
			})
			return
		}

		result, err := queries.DeleteBank(ctx, bankID)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23503" && pgErr.ConstraintName == "bank_accounts_bank_id_fkey" {
				applog.Warn(c, handlerDeleteBank, "conflict",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "Cannot delete a bank that has accounts. Delete its accounts first.",
					Code:    constants.BankHasAccounts,
				})
				return
			}
			applog.Error(c, handlerDeleteBank, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return

		}

		if result.RowsAffected() == 0 {
			applog.Warn(c, handlerDeleteBank, "resource not found")
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Bank not found",
				Code:    constants.BankNotFound,
			})
			return
		}

		applog.Info(c, handlerDeleteBank, "bank deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Bank deleted",
		})
	}
}
