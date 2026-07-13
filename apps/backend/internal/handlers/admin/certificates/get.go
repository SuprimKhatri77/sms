package certificates

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListStudentCertificates = "ListStudentCertificates"

func ListStudentCertificates(queries repository.CertificatesRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		studentID, err := utils.ConvertToUUID(c.Param("studentID"))
		if err != nil {
			applog.Warn(c, handlerListStudentCertificates, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		certificates, err := queries.ListStudentCertificates(ctx, studentID)
		if err != nil {
			applog.Error(c, handlerListStudentCertificates, "failed to list student certificates",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to list student certificates",
				Code:    constants.InternalServerError,
			})
			return
		}

		if certificates == nil {
			certificates = []db.ListStudentCertificatesRow{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    certificates,
		})
	}
}
