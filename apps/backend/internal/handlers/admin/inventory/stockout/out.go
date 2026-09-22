package out

import (
	"log/slog"
	"math"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerCreateStockOut = "CreateStockOut"

func CreateStockOut(queries repository.InventoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req types.CreateSaleBatchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateStockOut, "invalid request",
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

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerCreateStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to begin transaction",
				Code:    constants.InternalServerError,
			})
			return
		}
		defer tx.Rollback(ctx)
		qtx := queries.WithTx(tx)

		stockOuts := make([]db.StockOut, 0, len(req.Items))
		for _, item := range req.Items {
			productID, err := utils.ConvertToUUID(item.ProductID)
			if err != nil {
				applog.Warn(c, handlerCreateStockOut, "invalid request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid product ID format",
					Code:    constants.InvalidIDFormat,
				})
				return
			}

			stockOut, err := qtx.CreateStockOut(ctx, db.CreateStockOutParams{
				ProductID: productID,
				Qty:       int32(item.Quantity),
				Rate:      int32(math.Round(item.Rate * 100)),
				Date:      req.Date,
				Note:      utils.ToNullableText(req.Note),
				BillNo:    utils.ToNullableText(req.BillNo),
			})
			if err != nil {
				applog.Error(c, handlerCreateStockOut, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}

			stockOuts = append(stockOuts, stockOut)
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerCreateStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to commit transaction",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerCreateStockOut, "stock out created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Stock out created",
			Data:    stockOuts,
		})
	}
}
