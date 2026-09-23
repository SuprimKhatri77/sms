package cashledger

import (
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerCreateCashLedgerEntry = "CreateCashLedgerEntry"

type CreateCashLedgerEntryRequest struct {
	Date        string  `json:"date" binding:"required,date_format"`
	BsDate      string  `json:"bsDate" binding:"required,bs_date"`
	EntryType   string  `json:"entryType" binding:"required,oneof=cr dr"`
	Amount      float64 `json:"amount" binding:"required,gt=0,lte=10000000"`
	Description string  `json:"description" binding:"omitempty,notblank,min=5,max=200"`
	PaymentID   string  `json:"paymentID" binding:"omitempty,uuid"`
}

func CreateCashLedgerEntry(queries accountingRepository.CashLedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req CreateCashLedgerEntryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateCashLedgerEntry, "invalid request",
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

		adDate, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			applog.Warn(c, handlerCreateCashLedgerEntry, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid date format",
				Code:    constants.ValidationFailed,
			})
			return
		}

		if err := utils.ValidateBSMatchesAD(req.BsDate, adDate); err != nil {
			applog.Warn(c, handlerCreateCashLedgerEntry, "bs/ad date mismatch",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "BS date and AD date do not match",
				Code:    constants.ValidationFailed,
			})
			return
		}

		entry, err := queries.CreateCashLedgerEntry(ctx, db.CreateCashLedgerEntryParams{
			Amount:      int64(req.Amount * 100),
			EntryType:   req.EntryType,
			Description: utils.ToNullableText(req.Description),
			BsDate:      req.BsDate,
			Date:        pgtype.Timestamptz{Time: adDate, Valid: true},
			PaymentID:   utils.ToNullableUUID(req.PaymentID),
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) {
				switch pgErr.Code {
				case "23503":
					switch pgErr.ConstraintName {
					case "cash_ledger_payment_id_fkey":
						applog.Warn(c, handlerCreateCashLedgerEntry, "resource not found",
							slog.Any(applog.AttrError, err))
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "Payment not found",
							Code:    constants.PaymentNotFound,
						})
						return
					default:
						applog.Error(c, handlerCreateCashLedgerEntry, "failed to process request",
							slog.Any(applog.AttrError, err),
						)
						c.JSON(http.StatusInternalServerError, types.APIResponse{
							Success: false,
							Message: "Failed to process request",
							Code:    constants.InternalServerError,
						})
						return
					}
				case "23514":
					switch pgErr.ConstraintName {
					case "cash_ledger_entry_type_check":
						applog.Warn(c, handlerCreateCashLedgerEntry, "invalid request")
						c.JSON(http.StatusBadRequest, types.APIResponse{
							Success: false,
							Message: "Entry type must be one of cr or dr",
							Code:    constants.ValidationFailed,
						})
						return
					case "cash_ledger_amount_check":
						applog.Warn(c, handlerCreateCashLedgerEntry, "invalid request")
						c.JSON(http.StatusBadRequest, types.APIResponse{
							Success: false,
							Message: "Ledger amount must be greater than 0",
							Code:    constants.ValidationFailed,
						})
						return
					default:
						applog.Error(c, handlerCreateCashLedgerEntry, "failed to process request",
							slog.Any(applog.AttrError, err),
						)
						c.JSON(http.StatusInternalServerError, types.APIResponse{
							Success: false,
							Message: "Failed to process request",
							Code:    constants.ValidationFailed,
						})
						return
					}
				default:
					applog.Error(c, handlerCreateCashLedgerEntry, "failed to process request",
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
			applog.Error(c, handlerCreateCashLedgerEntry, "failed to process request",
				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerCreateCashLedgerEntry, "ledger entry created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Ledger entry created",
			Data:    entry,
		})
	}
}
