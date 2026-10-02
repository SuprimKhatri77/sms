package in

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/stockfifo"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerDeleteStockIn = "DeleteStockIn"

func DeleteStockIn(queries repository.InventoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		stockIDFromParam := c.Param("stockID")
		if stockIDFromParam == "" {
			applog.Warn(c, handlerDeleteStockIn, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing stock ID",
				Code:    constants.MissingStockID,
			})
			return
		}

		stockID, err := utils.ConvertToUUID(stockIDFromParam)
		if err != nil {
			applog.Warn(c, handlerDeleteStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid stock ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerDeleteStockIn, "failed to process request",
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

		products, err := stockfifo.LockRow(ctx, qtx, qtx.GetStockInProductID, stockID)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				applog.Warn(c, handlerDeleteStockIn, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Stock not found",
					Code:    constants.StockNotFound,
				})
				return
			case errors.Is(err, stockfifo.ErrProductNotFound):
				applog.Warn(c, handlerDeleteStockIn, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Product not found",
					Code:    constants.ProductNotFound,
				})
				return
			case errors.Is(err, stockfifo.ErrConcurrentChange):
				applog.Warn(c, handlerDeleteStockIn, "concurrent change",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "This entry was changed at the same time by someone else, please try again",
					Code:    constants.StockChangedConcurrently,
				})
				return
			}
			applog.Error(c, handlerDeleteStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		// the batch links point at this purchase (and block deleting it);
		// they're rebuilt below without it
		if err := stockfifo.Clear(ctx, qtx, products); err != nil {
			applog.Error(c, handlerDeleteStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		// remove the purchase's auto-recorded supplier ledger credit with it;
		// manual entries linked to the purchase stay (stock_in_id -> NULL)
		if err := qtx.DeleteStockInLedgerCredit(ctx, stockID); err != nil {
			applog.Error(c, handlerDeleteStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if err := qtx.DeleteStockIn(ctx, stockID); err != nil {
			applog.Error(c, handlerDeleteStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		// sales and wastage that used this batch must fit in the others,
		// otherwise the delete is refused
		if err := stockfifo.Rebuild(ctx, qtx, products); err != nil {
			var short *stockfifo.ShortfallError
			if errors.As(err, &short) {
				applog.Warn(c, handlerDeleteStockIn, "insufficient stock",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: short.Error(),
					Code:    constants.InsufficientStock,
				})
				return
			}
			applog.Error(c, handlerDeleteStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerDeleteStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to commit transaction",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerDeleteStockIn, "stock deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Stock deleted",
		})
	}
}
