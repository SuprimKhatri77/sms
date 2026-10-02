package out

import (
	"errors"
	"log/slog"
	"math"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/stockfifo"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerUpdateStockOut = "UpdateStockOut"

func UpdateStockOut(queries repository.InventoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
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

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerUpdateStockOut, "failed to process request",
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

		// the sale may move to another product; both need their stock redone
		products, err := stockfifo.LockRow(ctx, qtx, qtx.GetStockOutProductID, stockOutID, productID)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				applog.Warn(c, handlerUpdateStockOut, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Sale not found",
					Code:    constants.StockNotFound,
				})
				return
			case errors.Is(err, stockfifo.ErrProductNotFound):
				applog.Warn(c, handlerUpdateStockOut, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Product not found",
					Code:    constants.ProductNotFound,
				})
				return
			case errors.Is(err, stockfifo.ErrConcurrentChange):
				applog.Warn(c, handlerUpdateStockOut, "concurrent change",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "This entry was changed at the same time by someone else, please try again",
					Code:    constants.StockChangedConcurrently,
				})
				return
			}
			applog.Error(c, handlerUpdateStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		_, err = qtx.UpdateStockOut(ctx, db.UpdateStockOutParams{
			ProductID: productID,
			ID:        stockOutID,
			Date:      req.Date,
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

		if err := stockfifo.Rebuild(ctx, qtx, products); err != nil {
			var short *stockfifo.ShortfallError
			if errors.As(err, &short) {
				applog.Warn(c, handlerUpdateStockOut, "insufficient stock",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: short.Error(),
					Code:    constants.InsufficientStock,
				})
				return
			}
			applog.Error(c, handlerUpdateStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerUpdateStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to commit transaction",
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
