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

type UpdateDiscountRequest struct {
	StudentID string  `json:"studentID" binding:"required,uuid"`
	Type      string  `json:"type" binding:"required,min=1,max=50"`
	Note      string  `json:"note" binding:"omitempty,min=1,max=100"`
	Percent   float64 `json:"percent" binding:"omitempty,gte=0.01,lte=100"`
	Amount    float64 `json:"amount" binding:"omitempty,gt=0,lte=10000000"`
}

func UpdateDiscount(queries repository.StudentDiscounts) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		discountIDFromParam := c.Param("discountID")
		if discountIDFromParam == "" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing student discount ID",
				Code:    constants.MissingStudentDiscountID,
			})
			return
		}

		discountID, err := utils.ConvertToUUID(discountIDFromParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req UpdateDiscountRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Errors:  validator.Parse(err, req),
				Code:    constants.ValidationFailed,
			})
			return
		}

		studentID, err := utils.ConvertToUUID(req.StudentID)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
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

		existingDiscount, err := queries.GetDiscountByID(ctx, discountID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
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

		remainingBalance := effectiveFee - alreadyCovered + existingDiscount.Amount
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

		// remainingBalance already added back existingDiscount.Amount, so it's
		// the room left for this discount alone — comparing against
		// alreadyCovered+newDiscountAmount here would double-count the
		// discount's own pre-edit amount and wrongly reject a same-value edit.
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

		_, err = queries.UpdateDiscount(ctx, db.UpdateDiscountParams{
			ID:      discountID,
			Note:    utils.ToNullableText(req.Note),
			Type:    req.Type,
			Percent: percent,
			Amount:  newDiscountAmount,
			Mode:    mode,
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

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Student discount data updated",
		})
	}
}
