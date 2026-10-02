package banks

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerSetDefaultBank = "SetDefaultBank"

func SetDefaultBank(queries accountingRepository.BankTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		bankIDFromParam := c.Param("bankID")
		if bankIDFromParam == "" {
			applog.Warn(c, handlerSetDefaultBank, "invalid request",
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
			applog.Warn(c, handlerSetDefaultBank, "invalid request",
				slog.String("bankID_raw", bankIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerSetDefaultBank, "failed to process request",
				slog.String("bankID_raw", bankIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		isDefault, err := qtx.IsBankDefault(ctx, bankID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerSetDefaultBank, "resource not found",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Bank not found",
					Code:    constants.BankNotFound,
				})
				return
			}
			applog.Error(c, handlerSetDefaultBank, "failed to process request",
				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if isDefault {
			applog.Warn(c, handlerSetDefaultBank, "conflict")
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "Cannot unset default bank directly. Set another bank as default first.",
				Code:    constants.CannotUnsetDefaultBank,
			})
			return
		}

		if err := qtx.UnsetDefaultBank(ctx); err != nil {
			applog.Error(c, handlerSetDefaultBank, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		result, err := qtx.SetBankAsDefault(ctx, bankID)
		if err != nil {
			applog.Error(c, handlerSetDefaultBank, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if result.RowsAffected() == 0 {
			applog.Warn(c, handlerSetDefaultBank, "resource not found")
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Bank not found ",
				Code:    constants.BankNotFound,
			})
			return
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerSetDefaultBank, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Bank updated to be default",
		})

	}
}
