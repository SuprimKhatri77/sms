package in

import (
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
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
