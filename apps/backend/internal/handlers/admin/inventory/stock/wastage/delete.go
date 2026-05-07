package wastage

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

func DeleteWastage(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		wastageIDFromParam := c.Param("wastageID")
		if wastageIDFromParam == "" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing wastage ID",
				Code:    constants.MissingWastageID,
			})
			return
		}

		wastageID, err := utils.ConvertToUUID(wastageIDFromParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid wastage ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		err = queries.DeleteWastage(ctx, wastageID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Wastage stock deleted",
		})
	}
}
