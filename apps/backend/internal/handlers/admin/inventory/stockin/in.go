package in

import (
	"errors"
	"fmt"
	"log/slog"
	"math"
	"net/http"
	"time"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
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

const handlerCreateStockIn = "CreateStockIn"

type PurchaseLineItem struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Quantity  int     `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,gt=0"`
}

type CreateStockInRequest struct {
	Date       string             `json:"date" binding:"required,date_format"`
	InvoiceNo  string             `json:"invoiceNo" binding:"omitempty"`
	Note       string             `json:"note" binding:"omitempty"`
	BsDate     string             `json:"bsDate" binding:"required,bs_date"`
	SupplierID string             `json:"supplierID" binding:"required,uuid"`
	Items      []PurchaseLineItem `json:"items" binding:"required,min=1,max=100,dive"`
}

func CreateStockIn(queries repository.InventoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req CreateStockInRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Errors:  validator.Parse(err, req),
				Code:    constants.ValidationFailed,
			})
			return
		}

		utils.TrimStruct(&req)

		supplierID, err := utils.ConvertToUUID(req.SupplierID)
		if err != nil {
			applog.Warn(c, handlerCreateStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid supplier ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		adDate, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			applog.Warn(c, handlerCreateStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid date format",
				Code:    constants.ValidationFailed,
			})
			return
		}

		if err := utils.ValidateBSMatchesAD(req.BsDate, adDate); err != nil {
			applog.Warn(c, handlerCreateStockIn, "bs/ad date mismatch",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "BS date and AD date do not match",
				Code:    constants.ValidationFailed,
			})
			return
		}
		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerCreateStockIn, "failed to process request",
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

		desc := "Stock received - auto recorded"
		if req.InvoiceNo != "" {
			desc = fmt.Sprintf("Stock received - Invoice %s", req.InvoiceNo)
		}

		stockIns := make([]db.StockIn, 0, len(req.Items))
		for _, item := range req.Items {
			productID, err := utils.ConvertToUUID(item.ProductID)
			if err != nil {
				applog.Warn(c, handlerCreateStockIn, "invalid request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid product ID format",
					Code:    constants.InvalidIDFormat,
				})
				return
			}

			stockIn, err := qtx.CreateStockIn(ctx, db.CreateStockInParams{
				ProductID:  productID,
				Note:       utils.ToNullableText(req.Note),
				InvoiceNo:  utils.ToNullableText(req.InvoiceNo),
				Rate:       int32(math.Round(item.Rate * 100)),
				Qty:        int32(item.Quantity),
				Date:       req.BsDate,
				SupplierID: supplierID,
			})
			if err != nil {
				var pgErr *pgconn.PgError
				if errors.As(err, &pgErr) && pgErr.Code == "23503" {
					switch pgErr.ConstraintName {
					case "stock_in_supplier_id_fkey":
						applog.Warn(c, handlerCreateStockIn, "resource not found",
							slog.Any(applog.AttrError, err))
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "Supplier not found",
							Code:    constants.SupplierNotFound,
						})
						return
					case "stock_in_product_id_fkey":
						applog.Warn(c, handlerCreateStockIn, "resource not found")
						c.JSON(http.StatusNotFound, types.APIResponse{
							Success: false,
							Message: "Product not found",
							Code:    constants.ProductNotFound,
						})
						return
					}
				}
				applog.Error(c, handlerCreateStockIn, "failed to process request",
					slog.Any(applog.AttrError, err),
				)
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}

			_, err = qtx.CreateSupplierLedgerEntry(ctx, db.CreateSupplierLedgerEntryParams{
				SupplierID:  supplierID,
				Date:        pgtype.Timestamptz{Time: adDate, Valid: true},
				BsDate:      req.BsDate,
				EntryType:   "cr",
				Amount:      int64(math.Round(float64(item.Quantity) * item.Rate * 100)),
				Description: pgtype.Text{String: desc, Valid: true},
				StockInID:   stockIn.ID,
			})
			if err != nil {
				applog.Error(c, handlerCreateStockIn, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}

			stockIns = append(stockIns, stockIn)
		}

		if err := tx.Commit(ctx); err != nil {

			applog.Error(c, handlerCreateStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to commit transaction",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerCreateStockIn, "stock created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Stock created",
			Data:    stockIns,
		})
	}
}
