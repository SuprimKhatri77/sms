package out

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

const handlerUpdateStockOut = "UpdateStockOut"

func UpdateStockOut(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		stockOutIDFromParam := c.Param("stockOutID")
		if stockOutIDFromParam == "" {
			applog.Warn(c, handlerUpdateStockOut, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing stock ID",
				Code:    constants.MissingStockID,
			})
			return
		}

		stockOutID, err := utils.ConvertToUUID(stockOutIDFromParam)

		if err != nil {
			applog.Warn(c, handlerUpdateStockOut, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.UpdateStockOutRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerUpdateStockOut, "invalid request",
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
			applog.Warn(c, handlerUpdateStockOut, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid product ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		_, err = queries.UpdateStockOut(ctx, db.UpdateStockOutParams{
			ProductID: productID,
			ID:        stockOutID,
			Qty:       utils.RoundQty(req.Quantity),
			Rate:      int32(math.Round(req.Rate * 100)),
			Note:      utils.ToNullableText(req.Note),
			BillNo:    utils.ToNullableText(req.BillNo),
		})

		if err != nil {
			applog.Error(c, handlerUpdateStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerUpdateStockOut, "stock updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Stock updated",
		})

	}
}
