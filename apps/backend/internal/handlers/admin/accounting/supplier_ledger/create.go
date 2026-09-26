package supplierledger

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerCreateSupplierLedgerEntry = "CreateSupplierLedgerEntry"

// paymentDescription is the description on the cash/bank ledger debit
// auto-recorded when a supplier is paid.
func paymentDescription(companyName string) string {
	return fmt.Sprintf("Supplier payment - %s", companyName)
}

type CreateSupplierLedgerEntryRequest struct {
	Date          string  `json:"date" binding:"required,date_format"`
	BsDate        string  `json:"bsDate" binding:"required,bs_date"`
	EntryType     string  `json:"entryType" binding:"required,oneof=cr dr"`
	Amount        float64 `json:"amount" binding:"required,gt=0,lte=10000000"`
	Description   string  `json:"description" binding:"omitempty,notblank,min=5,max=200"`
	StockInID     string  `json:"stockInID" binding:"omitempty,uuid"`
	PaymentType   string  `json:"paymentType" binding:"required_if=EntryType dr,omitempty,notblank,min=2,max=100"`
	BankAccountID string  `json:"bankAccountID" binding:"omitempty,uuid"`
}

func CreateSupplierLedgerEntry(queries accountingRepository.SupplierLedgerTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		supplierIDFromParam := c.Param("supplierID")
		supplierID, err := utils.ConvertToUUID(supplierIDFromParam)
		if err != nil {
			applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing supplier ID",
				Code:    constants.MissingSupplierID,
			})
			return
		}

		var req CreateSupplierLedgerEntryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request body",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		adDate, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid date format",
				Code:    constants.ValidationFailed,
			})
			return
		}

		if err := utils.ValidateBSMatchesAD(req.BsDate, adDate); err != nil {
			applog.Warn(c, handlerCreateSupplierLedgerEntry, "bs/ad date mismatch",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "BS date and AD date do not match",
				Code:    constants.ValidationFailed,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to begin transaction",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to create supplier ledger entry",
				Code:    constants.InternalServerError,
			})
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		supplier, err := qtx.GetSupplierByID(ctx, supplierID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerCreateSupplierLedgerEntry, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Supplier not found",
					Code:    constants.SupplierNotFound,
				})
				return
			}
			applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to get supplier",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to create supplier ledger entry",
				Code:    constants.InternalServerError,
			})
			return
		}

		// A credit only records what we owe the supplier; no money moves, so
		// it carries no payment type (same as the credits stock-in records).
		isPayment := req.EntryType == "dr"
		if !isPayment {
			req.PaymentType = ""
		}

		_, err = qtx.CreateSupplierLedgerEntry(ctx, db.CreateSupplierLedgerEntryParams{
			SupplierID:  supplierID,
			Date:        pgtype.Timestamptz{Time: adDate, Valid: true},
			BsDate:      req.BsDate,
			StockInID:   utils.ToNullableUUID(req.StockInID),
			Description: utils.ToNullableText(req.Description),
			Amount:      utils.RupeesToPaisa(req.Amount),
			EntryType:   req.EntryType,
			PaymentType: req.PaymentType,
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) {
				switch pgErr.Code {
				case "23503":
					switch pgErr.ConstraintName {
					case "supplier_ledger_stock_in_id_fkey":
						applog.Warn(c, handlerCreateSupplierLedgerEntry, "resource not found",
							slog.Any(applog.AttrError, err))
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "Stock not found",
							Code:    constants.StockNotFound,
						})
						return
					case "supplier_ledger_supplier_id_fkey":
						applog.Warn(c, handlerCreateSupplierLedgerEntry, "resource not found")
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "Supplier not found",
							Code:    constants.SupplierNotFound,
						})
						return
					default:
						applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
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
			}
			applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		// Cash and bank ledgers read like a statement (cr = money in, dr =
		// money out), so paying a supplier is a dr there too. Only payments
		// move money; a credit records nothing in cash or bank.
		if isPayment && strings.EqualFold(req.PaymentType, "cash") {
			_, err = qtx.CreateCashLedgerEntry(ctx, db.CreateCashLedgerEntryParams{
				Amount:      utils.RupeesToPaisa(req.Amount),
				EntryType:   "dr",
				Description: pgtype.Text{String: paymentDescription(supplier.CompanyName), Valid: true},
				BsDate:      req.BsDate,
				Date:        pgtype.Timestamptz{Time: adDate, Valid: true},
			})

			if err != nil {
				var pgErr *pgconn.PgError
				if errors.As(err, &pgErr) {
					switch pgErr.Code {
					case "23503":
						switch pgErr.ConstraintName {
						case "cash_ledger_payment_id_fkey":
							applog.Warn(c, handlerCreateSupplierLedgerEntry, "resource not found",
								slog.Any(applog.AttrError, err))
							c.JSON(http.StatusNotFound, types.APIResponse{
								Success: false,
								Message: "Payment not found",
								Code:    constants.PaymentNotFound,
							})
							return
						default:
							applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
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
							applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request")
							c.JSON(http.StatusBadRequest, types.APIResponse{
								Success: false,
								Message: "Entry type must be one of cr or dr",
								Code:    constants.ValidationFailed,
							})
							return
						case "cash_ledger_amount_check":
							applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request")
							c.JSON(http.StatusBadRequest, types.APIResponse{
								Success: false,
								Message: "Ledger amount must be greater than 0",
								Code:    constants.ValidationFailed,
							})
							return
						default:
							applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
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
						applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
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
				applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to create cash ledger entry",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to create cash ledger entry",
					Code:    constants.InternalServerError,
				})
				return
			}

		} else if isPayment {
			var bankAccountID pgtype.UUID
			if strings.EqualFold(req.PaymentType, "bank") && req.BankAccountID != "" {
				bankAccountID, err = utils.ConvertToUUID(req.BankAccountID)
				if err != nil {
					applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusBadRequest, types.APIResponse{
						Success: false,
						Message: "Invalid ID format",
						Code:    constants.InvalidIDFormat,
					})
					return
				}
			} else {
				bankAccountID, err = qtx.GetDefaultBankAccountID(ctx)
				if err != nil {
					if errors.Is(err, pgx.ErrNoRows) {
						applog.Warn(c, handlerCreateSupplierLedgerEntry, "resource not found",
							slog.Any(applog.AttrError, err))
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "No default bank account configured",
							Code:    constants.NoDefaultBankAccount,
						})
						return
					}
					applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to get default bank account id",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusInternalServerError, types.APIResponse{
						Success: false,
						Message: "Failed to get default bank account id",
						Code:    constants.InternalServerError,
					})
					return
				}
			}
			_, err = qtx.CreateBankLedgerEntry(ctx, db.CreateBankLedgerEntryParams{
				Amount:        utils.RupeesToPaisa(req.Amount),
				BankAccountID: bankAccountID,
				EntryType:     "dr",
				Description:   pgtype.Text{String: paymentDescription(supplier.CompanyName), Valid: true},
				BsDate:        req.BsDate,
				Date:          pgtype.Timestamptz{Time: adDate, Valid: true},
			})
			if err != nil {
				var pgErr *pgconn.PgError
				if errors.As(err, &pgErr) {
					switch pgErr.Code {
					case "23503":
						switch pgErr.ConstraintName {
						case "bank_ledger_bank_account_id_fkey":
							applog.Warn(c, handlerCreateSupplierLedgerEntry, "resource not found",
								slog.Any(applog.AttrError, err))
							c.JSON(http.StatusNotFound, types.APIResponse{
								Success: false,
								Message: "Bank account not found",
								Code:    constants.BankAccountNotFound,
							})
							return
						case "bank_ledger_payment_id_fkey":
							applog.Warn(c, handlerCreateSupplierLedgerEntry, "resource not found")
							c.JSON(http.StatusNotFound, types.APIResponse{
								Success: false,
								Message: "Payment not found",
								Code:    constants.PaymentNotFound,
							})
							return
						default:
							applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
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
						case "bank_ledger_entry_type_check":
							applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request")
							c.JSON(http.StatusBadRequest, types.APIResponse{
								Success: false,
								Message: "Entry type must be one of cr or dr",
								Code:    constants.ValidationFailed,
							})
							return
						case "bank_ledger_amount_check":
							applog.Warn(c, handlerCreateSupplierLedgerEntry, "invalid request")
							c.JSON(http.StatusBadRequest, types.APIResponse{
								Success: false,
								Message: "Ledger amount must be greater than 0",
								Code:    constants.ValidationFailed,
							})
							return
						default:
							applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
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
						applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to process request",
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
				applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to create bank ledger entry",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to create bank ledger entry",
					Code:    constants.InternalServerError,
				})
				return
			}
		}

		applog.Info(c, handlerCreateSupplierLedgerEntry, "ledger entry created")

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerCreateSupplierLedgerEntry, "failed to commit transaction",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to create supplier ledger entry",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Ledger entry created",
		})
	}
}
