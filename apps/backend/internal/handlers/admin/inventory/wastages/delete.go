package wastage

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

const handlerDeleteWastage = "DeleteWastage"

func DeleteWastage(queries repository.InventoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		wastageIDFromParam := c.Param("wastageID")
		if wastageIDFromParam == "" {
			applog.Warn(c, handlerDeleteWastage, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing wastage ID",
				Code:    constants.MissingWastageID,
			})
			return
		}

		wastageID, err := utils.ConvertToUUID(wastageIDFromParam)
		if err != nil {
			applog.Warn(c, handlerDeleteWastage, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid wastage ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerDeleteWastage, "failed to process request",
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

		products, err := stockfifo.LockRow(ctx, qtx, qtx.GetWastageProductID, wastageID)
		if err != nil {
			switch {
			case errors.Is(err, pgx.ErrNoRows):
				applog.Warn(c, handlerDeleteWastage, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Wastage not found",
					Code:    constants.WastageNotFound,
				})
				return
			case errors.Is(err, stockfifo.ErrProductNotFound):
				applog.Warn(c, handlerDeleteWastage, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Product not found",
					Code:    constants.ProductNotFound,
				})
				return
			case errors.Is(err, stockfifo.ErrConcurrentChange):
				applog.Warn(c, handlerDeleteWastage, "concurrent change",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "This entry was changed at the same time by someone else, please try again",
					Code:    constants.StockChangedConcurrently,
				})
				return
			}
			applog.Error(c, handlerDeleteWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if err := qtx.DeleteWastage(ctx, wastageID); err != nil {
			applog.Error(c, handlerDeleteWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		// later sales and wastage move up to the batches this was using.
		// Freeing stock only falls short if the history already was.
		if err := stockfifo.Rebuild(ctx, qtx, products); err != nil {
			var short *stockfifo.ShortfallError
			if errors.As(err, &short) {
				applog.Warn(c, handlerDeleteWastage, "insufficient stock",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: short.Error(),
					Code:    constants.InsufficientStock,
				})
				return
			}
			applog.Error(c, handlerDeleteWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerDeleteWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to commit transaction",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerDeleteWastage, "wastage stock deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Wastage stock deleted",
		})
	}
}
