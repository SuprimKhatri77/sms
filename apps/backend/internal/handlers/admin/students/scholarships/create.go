package scholarship

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

type CreateScholarshipRequest struct {
	Percent float64 `json:"percent" binding:"required,gt=0,lte=100"`
	Note    string  `json:"note" binding:"omitempty,min=1,max=100"`
}

func CreateScholarship(queries repository.StudentsScholarship) gin.HandlerFunc {
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
				Message: "Missing student ID",
				Code:    constants.MissingStudentID,
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

		var req CreateScholarshipRequest
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

		summary, err := queries.GetStudentFeeSummary(ctx, studentID)
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
		slog.Debug("scholarship balance calculated",
			slog.String("handler", "CreateScholarship"),
			slog.String("student_id", studentIDFromParam),
			slog.Int64("total_paid", summary.TotalPaid),
			slog.Int64("total_fee", summary.TotalFee),
			slog.Int64("discount_amount", discountAmount),
			slog.Int64("scholarship_amount", scholarshipAmount),
			slog.Int64("already_covered", alreadyCovered),
			slog.Int64("remaining_balance", remainingBalance),
		)
		if remainingBalance <= 0 {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "No outstanding balance remaining to apply scholarship",
				Code:    constants.ValidationFailed,
			})
			return
		}

		newScholarshipAmount := utils.PercentToAmount(remainingBalance, req.Percent)

		percent, err := utils.ToNumeric(req.Percent)
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

		scholarship, err := queries.CreateScholarship(ctx, db.CreateScholarshipParams{
			Percent:   percent,
			Note:      utils.ToNullableText(req.Note),
			StudentID: studentID,
			Amount:    newScholarshipAmount,
			AddedBy:   adminID,
		})

		if err != nil {

			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "Student already has a scholarship",
					Code:    constants.ValidationFailed,
				})
				return
			}
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
			Message: "Scholarship added for the student",
			Data:    scholarship,
		})

	}
}
