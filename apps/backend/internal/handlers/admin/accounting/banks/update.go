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
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerUpdateBank = "UpdateBank"

type UpdateBankRequest struct {
	Name string `json:"name" binding:"required,notblank,min=2,max=100"`
}

func UpdateBank(queries accountingRepository.BankRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		bankIDFromParam := c.Param("bankID")
		if bankIDFromParam == "" {
			applog.Warn(c, handlerUpdateBank, "invalid request",
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
			applog.Warn(c, handlerUpdateBank, "invalid request",
				slog.String("bankID_raw", bankIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req UpdateBankRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerUpdateBank, "invalid request",
				slog.String("bankID_raw", bankIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		bank, err := queries.UpdateBank(ctx, db.UpdateBankParams{
			Name: req.Name,
			ID:   bankID,
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				switch pgErr.ConstraintName {
				case "idx_banks_single_default":
					applog.Warn(c, handlerUpdateBank, "conflict",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Only one bank can be set as default",
						Code:    constants.DefaultBankAlreadyExists,
					})
					return
				case "banks_name_key":
					applog.Warn(c, handlerUpdateBank, "conflict")
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Bank with this name already exists",
						Code:    constants.BankAlreadyExists,
					})
					return
				default:
					applog.Error(c, handlerUpdateBank, "failed to process request",
						slog.Any(applog.AttrError, err),
					)
					c.JSON(http.StatusInternalServerError, types.APIResponse{
						Success: false,
						Message: "Failed to process request",
						Code:    constants.InternalServerError,
					})
					return
				}

			}

			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerUpdateBank, "resource not found",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Bank not found",
					Code:    constants.BankNotFound,
				})
				return
			}

			applog.Error(c, handlerUpdateBank, "failed to process request",

				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerUpdateBank, "bank data updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Bank data updated",
			Data:    bank,
		})
	}
}
