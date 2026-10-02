package wastage

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/stockfifo"
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

		productIDs := make([]pgtype.UUID, len(req.Items))
		for i, item := range req.Items {
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

			productIDs[i] = productID
		}

		// one stock change per product at a time, until commit
		products, err := stockfifo.Lock(ctx, qtx, productIDs...)
		if err != nil {
			if errors.Is(err, stockfifo.ErrProductNotFound) {
				applog.Warn(c, handlerCreateWastage, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Product not found",
					Code:    constants.ProductNotFound,
				})
				return
			}
			applog.Error(c, handlerCreateWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		wastages := make([]db.Wastage, 0, len(req.Items))
		lineOf := make(map[[16]byte]int, len(req.Items))
		for i, item := range req.Items {
			wastage, err := qtx.CreateWastage(ctx, db.CreateWastageParams{
				ProductID: productIDs[i],
				Date:      req.Date,
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
			lineOf[wastage.ID.Bytes] = i
		}

		// take the wastage out of the purchase batches, oldest first
		if err := stockfifo.Rebuild(ctx, qtx, products); err != nil {
			var short *stockfifo.ShortfallError
			if errors.As(err, &short) {
				applog.Warn(c, handlerCreateWastage, "insufficient stock",
					slog.Any(applog.AttrError, err))
				resp := types.APIResponse{
					Success: false,
					Message: short.Error(),
					Code:    constants.InsufficientStock,
				}
				// point at the line when it's one of these new entries (it can
				// also be an existing later one this is dated before)
				if i, ok := lineOf[short.Shortfall.Consumer.ID.Bytes]; ok {
					resp.Errors = []types.AppError{{
						Code:    constants.InsufficientStock,
						Field:   fmt.Sprintf("items.%d.quantity", i),
						Message: short.LineMessage(),
					}}
				}
				c.JSON(http.StatusConflict, resp)
				return
			}
			applog.Error(c, handlerCreateWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
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
