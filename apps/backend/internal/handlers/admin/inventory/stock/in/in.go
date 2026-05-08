package in

import (
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

func CreateStockIn(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req types.CreateStockInRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Errors:  validator.Parse(err, req),
				Code:    constants.ValidationFailed,
			})
			return
		}

		utils.TrimStruct(&req)

		productID, err := utils.ConvertToUUID(req.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid product ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		stockIn, err := queries.CreateStockIn(ctx, db.CreateStockInParams{
			ProductID: productID,
			Note:      utils.ToNullableText(req.Note),
			InvoiceNo: utils.ToNullableText(req.InvoiceNo),
			Rate:      int32(math.Round(req.Rate * 100)),
			Qty:       int32(req.Quantity),
			Date:      req.Date,
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Stock created",
			Data:    stockIn,
		})
	}
}
