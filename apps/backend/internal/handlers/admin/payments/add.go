package payments

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

type AddPaymentRequest struct {
	Amount        float64 `json:"amount" binding:"required,min=0.01"`
	PaymentMode   string  `json:"paymentMode" binding:"required,notblank,min=1,max=50"`
	Remarks       string  `json:"remarks,omitempty" binding:"omitempty,notblank,min=1,max=200"`
	BsDate        string  `json:"bsDate" binding:"required,bs_date"`
	Date          string  `json:"date" binding:"required,date_format"`
	BankAccountID string  `json:"bankAccountID" binding:"omitempty,uuid"`
}

func AddPayment(queries repository.AdminPaymentTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		userIDFromContext := c.MustGet("userID").(string)

		studentIDFromParams := c.Param("studentID")
		studentID, err := utils.ConvertToUUID(studentIDFromParams)
		if err != nil {
			slog.Warn("invalid student id format",
				slog.String("handler", "AddPayment"),
				slog.String("student_id_raw", studentIDFromParams),
				slog.Any("error", err),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req AddPaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			slog.Warn("invalid request body",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		addedBy, err := utils.ConvertToUUID(userIDFromContext)
		if err != nil {
			slog.Warn("invalid added_by id",
				slog.String("handler", "AddPayment"),
				slog.String("added_by_raw", userIDFromContext),
				slog.Any("error", err),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		adDate, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			slog.Error("failed to parse date",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid date format",
				Code:    constants.ValidationFailed,
			})
			return
		}

		if err := utils.ValidateBSMatchesAD(req.BsDate, adDate); err != nil {
			slog.Warn("bs/ad date mismatch",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "BS date and AD date do not match",
				Code:    constants.ValidationFailed,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			slog.Error("failed to begin transaction",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		summary, err := qtx.GetStudentFeeSummary(ctx, studentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		effectiveFee := summary.TotalFee
		discountAmount := summary.TotalDiscountAmount
		scholarshipAmount := summary.ScholarshipAmount
		alreadyCovered := summary.TotalPaid + discountAmount + scholarshipAmount
		remaining := effectiveFee - alreadyCovered
		slog.Debug("fee summary calculated",
			slog.String("handler", "AddPayment"),
			slog.String("student_id", studentIDFromParams),
			slog.Int64("total_paid", summary.TotalPaid),
			slog.Int64("total_fee", summary.TotalFee),
			slog.Int64("discount_amount", discountAmount),
			slog.Int64("scholarship_amount", scholarshipAmount),
			slog.Int64("already_covered", alreadyCovered),
			slog.Int64("remaining", remaining),
		)
		if remaining <= 0 {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "No outstanding balance remaining to add payment",
				Code:    constants.ValidationFailed,
			})
			return
		}

		amount := utils.RupeesToPaisa(req.Amount)
		if amount > remaining {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Payment amount is greater than outstanding fees",
				Code:    constants.ValidationFailed,
			})
			return
		}

		student, err := qtx.GetStudentByID(ctx, studentID)

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Student not found",
					Code:    constants.StudentNotFound,
				})
				return
			}
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if student.Status != "active" && student.Status != "completed" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Cannot add payment for a student with pending or rejected status",
				Code:    constants.InvalidStudentStatus,
			})
			return
		}

		slog.Info("adding payment",
			slog.String("handler", "AddPayment"),
			slog.String("student_id", studentIDFromParams),
			slog.String("added_by", userIDFromContext),
			slog.Int("amount", int(amount)),
		)

		payment, err := qtx.AddPayment(ctx, db.AddPaymentParams{
			StudentID:   studentID,
			Amount:      int32(amount),
			Remarks:     utils.ToNullableText(req.Remarks),
			AddedBy:     addedBy,
			PaymentMode: req.PaymentMode,
			Date:        pgtype.Timestamptz{Time: adDate, Valid: true},
			BsDate:      req.BsDate,
		})

		if err != nil {
			var pgErr *pgconn.PgError

			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				slog.Warn("foreign key violation",
					slog.String("handler", "AddPayment"),
					slog.String("constraint", pgErr.ConstraintName),
					slog.String("student_id", studentIDFromParams),
					slog.String("added_by", userIDFromContext),
				)

				switch pgErr.ConstraintName {
				case "payments_student_id_fkey":
					c.JSON(http.StatusNotFound, types.APIResponse{
						Success: false,
						Message: "Student not found",
						Code:    constants.StudentNotFound,
					})
				case "payments_added_by_fkey":
					c.JSON(http.StatusNotFound, types.APIResponse{
						Success: false,
						Message: "Admin not found",
						Code:    constants.UserNotFound,
					})
				}
				return
			}

			slog.Error("failed to add payment",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
				slog.String("student_id", studentIDFromParams),
				slog.String("added_by", userIDFromContext),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("payment added successfully",
			slog.String("handler", "AddPayment"),
			slog.String("student_id", studentIDFromParams),
			slog.String("added_by", userIDFromContext),
			slog.Int("amount", int(amount)),
		)

		if strings.EqualFold(req.PaymentMode, "cash") {

			_, err = qtx.CreateCashLedgerEntry(ctx, db.CreateCashLedgerEntryParams{
				Amount:      amount,
				EntryType:   "cr",
				Description: pgtype.Text{String: "Student payment - auto recorded", Valid: true},
				PaymentID:   payment.ID,
				BsDate:      req.BsDate,
				Date:        pgtype.Timestamptz{Time: adDate, Valid: true},
			})
			if err != nil {
				slog.Error("failed to create cash ledger entry",
					slog.String("handler", "AddPayment"),
					slog.Any("error", err),
					// slog.String("payment_id", payment.ID.String),
					slog.String("remarks", req.Remarks),
				)
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
		} else {
			var bankAccountID pgtype.UUID
			if strings.EqualFold(req.PaymentMode, "bank") && req.BankAccountID != "" {
				bankAccountID, err = utils.ConvertToUUID(req.BankAccountID)
				if err != nil {
					slog.Warn("invalid bank account id format",
						slog.String("handler", "AddPayment"),
						slog.String("bank_account_id_raw", req.BankAccountID),
						slog.Any("error", err),
					)
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
					slog.Error("failed to get default bank account",
						slog.String("handler", "AddPayment"),
						slog.Any("error", err),
					)
					if errors.Is(err, pgx.ErrNoRows) {
						c.JSON(http.StatusBadRequest, types.APIResponse{
							Success: false,
							Message: "No default bank account configured. Please set a default bank account first.",
							Code:    constants.NoDefaultBankAccount,
						})
						return
					}
					c.JSON(http.StatusInternalServerError, types.APIResponse{
						Success: false,
						Message: "Failed to process request",
						Code:    constants.InternalServerError,
					})
					return
				}
			}
			_, err = qtx.CreateBankLedgerEntry(ctx, db.CreateBankLedgerEntryParams{
				Amount:        amount,
				EntryType:     "cr",
				Description:   pgtype.Text{String: "Student payment - auto recorded", Valid: true},
				PaymentID:     payment.ID,
				BankAccountID: bankAccountID,
				BsDate:        req.BsDate,
				Date:          pgtype.Timestamptz{Time: adDate, Valid: true},
			})
			if err != nil {
				var pgErr *pgconn.PgError
				if errors.As(err, &pgErr) && pgErr.Code == "23503" {
					slog.Warn("foreign key violation",
						slog.String("handler", "AddPayment"),
						slog.String("constraint", pgErr.ConstraintName),
					)
					switch pgErr.ConstraintName {
					case "bank_ledger_bank_account_id_fkey":
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "Bank account not found",
							Code:    constants.BankAccountNotFound,
						})
						return
					case "bank_ledger_payment_id_fkey":
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "Payment not found",
							Code:    constants.PaymentNotFound,
						})
						return
					}
				}
				slog.Error("failed to create bank ledger entry",
					slog.String("handler", "AddPayment"),
					slog.Any("error", err),
					// slog.String("payment_id", payment.ID.String),
					slog.String("remarks", req.Remarks),
				)
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}

		}

		if err := tx.Commit(ctx); err != nil {
			slog.Error("failed to commit transaction",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Payment added",
		})

	}
}
