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

type UpdateScholarshipRequest struct {
	Percent float64 `json:"percent" binding:"required,gt=0,lte=100"`
	Note    string  `json:"note" binding:"omitempty,min=1,max=100"`
}

func UpdateScholarship(queries repository.StudentsScholarship) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		scholarshipIDFromParam := c.Param("scholarshipID")
		if scholarshipIDFromParam == "" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing student scholarship ID",
				Code:    constants.MissingStudentDiscountID,
			})
			return
		}

		scholarshipID, err := utils.ConvertToUUID(scholarshipIDFromParam)
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
		var req UpdateScholarshipRequest
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

		existingScholarship, err := queries.GetScholarshipByID(ctx, scholarshipID)
		if err != nil {

			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Scholarship not found",
					Code:    constants.ScholarshipNotFound,
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

		remainingBalance := effectiveFee - alreadyCovered + existingScholarship.Amount

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

		_, err = queries.UpdateScholarship(ctx, db.UpdateScholarshipParams{
			Percent: percent,
			Note:    utils.ToNullableText(req.Note),
			ID:      scholarshipID,
			Amount:  newScholarshipAmount,
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
			Message: "Scholarship updated for the student",
		})

	}
}
