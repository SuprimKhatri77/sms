package wastage

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

const handlerCreateWastage = "CreateWastage"

func CreateWastage(queries repository.InventoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req types.CreateWastageBatchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateWastage, "invalid request",
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
			applog.Error(c, handlerCreateWastage, "failed to process request",
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

		wastages := make([]db.Wastage, 0, len(req.Items))
		for _, item := range req.Items {
			productID, err := utils.ConvertToUUID(item.ProductID)
			if err != nil {
				applog.Warn(c, handlerCreateWastage, "invalid request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid product ID format",
					Code:    constants.InvalidIDFormat,
				})
				return
			}

			wastage, err := qtx.CreateWastage(ctx, db.CreateWastageParams{
				ProductID: productID,
				Date:      req.Date,
				Rate:      int32(math.Round(item.Rate * 100)),
				Reason:    utils.ToNullableText(req.Reason),
				Qty:       utils.RoundQty(item.Quantity),
			})
			if err != nil {
				applog.Error(c, handlerCreateWastage, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}

			wastages = append(wastages, wastage)
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerCreateWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to commit transaction",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerCreateWastage, "product added to wasted/damaged list")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Product added to wasted/damaged list",
			Data:    wastages,
		})
	}
}
