package courses

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerUpdateCourse = "UpdateCourse"

func UpdateCourse(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		courseIDFromParam := c.Param("courseID")
		if courseIDFromParam == "" {
			applog.Warn(c, handlerUpdateCourse, "invalid request",
				slog.String("courseID_raw", courseIDFromParam))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing course ID",
				Code:    constants.MissingCourseID,
			})
			return
		}

		courseID, err := utils.ConvertToUUID(courseIDFromParam)

		if err != nil {
			applog.Warn(c, handlerUpdateCourse, "invalid request",
				slog.String("courseID_raw", courseIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.UpdateCourse
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerUpdateCourse, "invalid request",
				slog.String("courseID_raw", courseIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid req body",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		_, err = queries.UpdateCourse(ctx, db.UpdateCourseParams{
			Name:     strings.ToLower(req.Name),
			Fee:      int32(utils.RupeesToPaisa(req.Fee)),
			ID:       courseID,
			IsActive: *req.IsActive,
		})

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerUpdateCourse, "resource not found",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Course not found",
					Code:    constants.CourseNotFound,
				})
				return
			}
			applog.Error(c, handlerUpdateCourse, "failed to process request",
				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to update course",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerUpdateCourse, "course updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Course updated",
		})

	}
}
