package courses

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

func ToggleCourse(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		courseIDFromParam := c.Param("courseID")
		if courseIDFromParam == "" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing course ID",
				Code:    constants.MissingCourseID,
			})
			return
		}

		courseID, err := utils.ConvertToUUID(courseIDFromParam)

		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.ToggleCourseStatus
		slog.Debug("req body", "body", req)
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid course status",
				Code:    constants.ValidationFailed,
			})
			return
		}

		_, err = queries.ToggleCourseActive(ctx, db.ToggleCourseActiveParams{
			ID:       courseID,
			IsActive: *req.IsActive,
		})

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Course not found",
					Code:    constants.CourseNotFound,
				})
				return
			}
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to toggle course status",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Course status updated",
		})

	}
}
