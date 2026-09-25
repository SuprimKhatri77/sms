package wastage

import (
	"log/slog"
	"math"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerUpdateWastage = "UpdateWastage"

func UpdateWastage(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		wastageIDFromParam := c.Param("wastageID")
		if wastageIDFromParam == "" {
			applog.Warn(c, handlerUpdateWastage, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing wastage ID",
				Code:    constants.MissingWastageID,
			})
			return
		}

		wastageID, err := utils.ConvertToUUID(wastageIDFromParam)
		if err != nil {
			applog.Warn(c, handlerUpdateWastage, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid wastage ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.UpdateWastageRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerUpdateWastage, "invalid request",
				slog.Any(applog.AttrError, err))
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
			applog.Warn(c, handlerUpdateWastage, "invalid request",
				slog.Any(applog.AttrError, err))
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
			Rate:      int32(math.Round(req.Rate * 100)),
			Qty:       utils.RoundQty(req.Quantity),
			Reason:    utils.ToNullableText(req.Reason),
			ID:        wastageID,
		})

		if err != nil {
			applog.Error(c, handlerUpdateWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerUpdateWastage, "stock updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Stock updated",
		})
	}
}
