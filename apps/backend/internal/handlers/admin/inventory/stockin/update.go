package in

import (
	"errors"
	"log/slog"
	"math"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerUpdateStockIn = "UpdateStockIn"

func UpdateStockIn(queries repository.InventoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		stockIDFromParam := c.Param("stockID")
		if stockIDFromParam == "" {
			applog.Warn(c, handlerUpdateStockIn, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing stock ID",
				Code:    constants.MissingStockID,
			})
			return
		}

		stockID, err := utils.ConvertToUUID(stockIDFromParam)
		if err != nil {
			applog.Warn(c, handlerUpdateStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid stock ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.UpdateStockInRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerUpdateStockIn, "invalid request",
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
			applog.Warn(c, handlerUpdateStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid product ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		supplierID, err := utils.ConvertToUUID(req.SupplierID)
		if err != nil {
			applog.Warn(c, handlerUpdateStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid supplier ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		// the edit form only carries the BS date; the ledger credit also
		// stores the AD date, so derive it here
		adDate, err := utils.BSToAD(req.Date)
		if err != nil {
			applog.Warn(c, handlerUpdateStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid BS date",
				Code:    constants.ValidationFailed,
			})
			return
		}

		qty := utils.RoundQty(req.Quantity)
		ratePaisa := int32(math.Round(req.Rate * 100))
		if utils.LineAmount(qty, ratePaisa) < 1 {
			applog.Warn(c, handlerUpdateStockIn, "line amount below 1 paisa")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Item total (qty x rate) must be at least Rs. 0.01",
				Code:    constants.ValidationFailed,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerUpdateStockIn, "failed to process request",
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

		stockIn, err := qtx.UpdateStockIn(ctx, db.UpdateStockInParams{
			ID:         stockID,
			ProductID:  productID,
			SupplierID: supplierID,
			Rate:       ratePaisa,
			Qty:        qty,
			Note:       utils.ToNullableText(req.Note),
			InvoiceNo:  utils.ToNullableText(req.InvoiceNo),
			Date:       req.Date,
		})
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerUpdateStockIn, "resource not found")
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Stock not found",
					Code:    constants.StockNotFound,
				})
				return
			}
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				switch pgErr.ConstraintName {
				case "stock_in_supplier_id_fkey":
					applog.Warn(c, handlerUpdateStockIn, "resource not found",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusNotFound, types.APIResponse{
						Success: false,
						Message: "Supplier not found",
						Code:    constants.SupplierNotFound,
					})
					return
				case "stock_in_product_id_fkey":
					applog.Warn(c, handlerUpdateStockIn, "resource not found")
					c.JSON(http.StatusNotFound, types.APIResponse{
						Success: false,
						Message: "Product not found",
						Code:    constants.ProductNotFound,
					})
					return
				}
			}
			applog.Error(c, handlerUpdateStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		// keep the purchase's auto-recorded supplier ledger credit in sync
		updatedCredits, err := qtx.UpdateStockInLedgerCredit(ctx, db.UpdateStockInLedgerCreditParams{
			StockInID:   stockIn.ID,
			SupplierID:  supplierID,
			Date:        pgtype.Timestamptz{Time: adDate, Valid: true},
			BsDate:      req.Date,
			Amount:      utils.LineAmount(stockIn.Qty, stockIn.Rate),
			Description: pgtype.Text{String: ledgerDescription(req.InvoiceNo), Valid: true},
		})
		if err != nil {
			applog.Error(c, handlerUpdateStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		if updatedCredits == 0 {
			// purchases recorded before the supplier ledger was wired up have
			// no credit; editing one deliberately doesn't backfill it
			applog.Info(c, handlerUpdateStockIn, "no supplier ledger credit for purchase, ledger left unchanged")
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerUpdateStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to commit transaction",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerUpdateStockIn, "stock updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Stock updated",
		})

	}
}
