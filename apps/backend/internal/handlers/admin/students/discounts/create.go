package discount

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

type CreateDiscountRequest struct {
	Type    string  `json:"type" binding:"required,min=1,max=50"`
	Note    string  `json:"note" binding:"omitempty,min=1,max=100"`
	Percent float64 `json:"percent" binding:"omitempty,gte=0.01,lte=100"`
	Amount  float64 `json:"amount" binding:"omitempty,gt=0,lte=10000000"`
}

func CreateDiscount(queries repository.StudentDiscounts) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		adminIDFromContext := c.MustGet("userID").(string)
		adminID, err := utils.ConvertToUUID(adminIDFromContext)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		studentIDFromParam := c.Param("studentID")
		if studentIDFromParam == "" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing student discount ID",
				Code:    constants.MissingStudentDiscountID,
			})
			return
		}

		studentID, err := utils.ConvertToUUID(studentIDFromParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req CreateDiscountRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		hasPercent := req.Percent > 0
		hasAmount := req.Amount > 0
		if hasPercent == hasAmount {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Provide either a percent or a flat amount, not both",
				Code:    constants.ValidationFailed,
			})
			return
		}

		mode := "percent"
		if !hasPercent {
			mode = "amount"
		}

		summary, err := queries.GetStudentFeeSummary(ctx, studentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if summary.Status != "active" && summary.Status != "completed" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Discount can only be applied to active or completed students",
				Code:    constants.ValidationFailed,
			})
			return
		}

		effectiveFee := summary.TotalFee
		discountAmount := summary.TotalDiscountAmount
		scholarshipAmount := summary.ScholarshipAmount
		alreadyCovered := summary.TotalPaid + discountAmount + scholarshipAmount
		remainingBalance := effectiveFee - alreadyCovered
		slog.Debug("discount balance calculated",
			slog.String("handler", "CreateDiscount"),
			slog.String("student_id", studentIDFromParam),
			slog.Int64("total_paid", summary.TotalPaid),
			slog.Int64("effective_fee", effectiveFee),
			slog.Int64("discount_amount", discountAmount),
			slog.Int64("scholarship_amount", scholarshipAmount),
			slog.Int64("already_covered", alreadyCovered),
			slog.Int64("remaining_balance", remainingBalance),
		)
		if remainingBalance <= 0 {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "No outstanding balance remaining to apply discount",
				Code:    constants.ValidationFailed,
			})
			return
		}

		var newDiscountAmount int64
		var percentValue float64
		if hasPercent {
			newDiscountAmount = utils.PercentToAmount(remainingBalance, req.Percent)
			percentValue = req.Percent
		} else {
			newDiscountAmount = utils.RupeesToPaisa(req.Amount)
			percentValue = utils.AmountToPercent(remainingBalance, newDiscountAmount)
		}

		// remainingBalance is already the room left for this discount alone,
		// so this single check covers both percent- and amount-mode.
		if newDiscountAmount > remainingBalance {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Discount exceeds outstanding balance",
				Code:    constants.ValidationFailed,
			})
			return
		}

		percent, err := utils.ToNumeric(percentValue)
		if err != nil {
			slog.Error("failed to convert percent",
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		discount, err := queries.CreateDiscount(ctx, db.CreateDiscountParams{
			StudentID: studentID,
			Type:      req.Type,
			Note:      utils.ToNullableText(req.Note),
			Percent:   percent,
			Amount:    newDiscountAmount,
			AddedBy:   adminID,
			Mode:      mode,
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				c.JSON(http.StatusConflict, types.APIResponse{
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

		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Discount added for the student",
			Data:    discount,
		})

	}
}
