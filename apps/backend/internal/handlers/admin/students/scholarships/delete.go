package scholarship

import (
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerDeleteScholarship = "DeleteScholarship"

func DeleteScholarship(queries repository.StudentsScholarship) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		scholarshipIDFromParam := c.Param("scholarshipID")
		if scholarshipIDFromParam == "" {
			applog.Warn(c, handlerDeleteScholarship, "invalid request",
				slog.String("scholarshipID_raw", scholarshipIDFromParam))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing student scholarship ID",
				Code:    constants.MissingStudentScholarshipID,
			})
			return
		}

		scholarshipID, err := utils.ConvertToUUID(scholarshipIDFromParam)
		if err != nil {
			applog.Warn(c, handlerDeleteScholarship, "invalid request",
				slog.String("scholarshipID_raw", scholarshipIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		err = queries.DeleteScholarship(ctx, scholarshipID)
		if err != nil {
			applog.Error(c, handlerDeleteScholarship, "failed to process request",
				slog.String("scholarshipID_raw", scholarshipIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerDeleteScholarship, "scholarship removed for the student",
			slog.String("scholarshipID_raw", scholarshipIDFromParam))
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Scholarship removed for the student",
		})
	}
}
