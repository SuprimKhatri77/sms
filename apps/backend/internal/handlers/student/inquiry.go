package student

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

func CreateInquiry(queries repository.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req types.CreateStudentInquiryRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			slog.Warn("invalid inquiry payload",
				"path", c.FullPath(),
				"ip", c.ClientIP(),
				"error", err,
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request body",
				Errors:  validator.Parse(err, req),
				Code:    constants.ValidationFailed,
			})
			return
		}

		utils.TrimStruct(&req)

		_, err := queries.CreateInquiry(ctx, db.CreateInquiryParams{
			FullName: req.FullName,
			Email:    pgtype.Text{String: req.Email, Valid: true},
			Phone:    req.Phone,
			Message:  req.Message,
			Source:   req.Source,
		})

		if err != nil {
			slog.Error("failed to create inquiry",
				"email", req.Email,
				"phone", req.Phone,
				"source", req.Source,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to submit inquiry. Please try again later.",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("inquiry created successfully",
			"email", req.Email,
			"phone", req.Phone,
			"source", req.Source,
			"path", c.FullPath(),
			"ip", c.ClientIP(),
		)

		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Inquiry submitted successfully. Our team will contact you soon.",
		})
	}
}
