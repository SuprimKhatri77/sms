package courses

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

func DeleteCourse(queries repository.AdminRepository) gin.HandlerFunc {
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

		result, err := queries.DeleteCourse(ctx, courseID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if result.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Course not found",
				Code:    constants.CourseNotFound,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Course deleted",
		})
	}
}
