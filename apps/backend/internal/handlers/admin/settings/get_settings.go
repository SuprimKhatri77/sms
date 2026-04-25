package settings

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

func GetSettings(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		settings, err := queries.GetAdmissionSettings(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to fetch settings",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(settings) == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data:    []db.Setting{},
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    settings,
		})
	}
}
