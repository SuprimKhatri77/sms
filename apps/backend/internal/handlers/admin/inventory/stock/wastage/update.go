package wastage

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

func UpdateWastage(queries repository.InventoryRepository) gin.HandlerFunc {
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

		var req types.UpdateWastageRequest
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

		productID, err := utils.ConvertToUUID(req.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid productID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		_, err = queries.UpdateWastage(ctx, db.UpdateWastageParams{
			ProductID: productID,
			Date:      req.Date,
			Rate:      int32(req.Rate),
			Qty:       int32(req.Quantity),
			Reason:    utils.ToNullableText(req.Reason),
			ID:        wastageID,
		})

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
			Message: "Stock updated",
		})
	}
}
