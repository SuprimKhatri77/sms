package summary

import (
	"fmt"
	"log/slog"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/export"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerExportInventorySummary = "ExportInventorySummary"

type ExportInventorySummaryParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	From   string `form:"from" binding:"omitempty,bs_date"`
	To     string `form:"to" binding:"omitempty,bs_date"`
}

// ExportInventorySummary downloads the per-product stock summary for the
// given BS date range as CSV, XLSX or PDF, with the amount columns totalled.
// Quantities aren't totalled since products use different units.
func ExportInventorySummary(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportInventorySummaryParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportInventorySummary, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		summary, err := queries.GetInventorySummary(ctx, db.GetInventorySummaryParams{
			From: utils.ToNullableText(params.From),
			To:   utils.ToNullableText(params.To),
		})
		if err != nil {
			applog.Error(c, handlerExportInventorySummary, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(summary))
		var openingSum, inSum, outSum, outCostSum, wasteCostSum, closingSum int64
		for _, s := range summary {
			var values [11]float64
			for i, n := range []pgtype.Numeric{
				s.OpeningQty, s.OpeningAmount,
				s.StockInQty, s.StockInAmount,
				s.StockOutQty, s.StockOutAmount, s.StockOutCost,
				s.WastageQty, s.WastageCost,
				s.ClosingQty, s.ClosingAmount,
			} {
				values[i], err = utils.NumericToFloat64(n)
				if err != nil {
					applog.Error(c, handlerExportInventorySummary, "failed to process request",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusInternalServerError, types.APIResponse{
						Success: false,
						Message: "Failed to process request",
						Code:    constants.InternalServerError,
					})
					return
				}
			}

			// amounts are sums of whole-paisa line amounts, so rounding
			// only strips float noise
			openingAmt := int64(math.Round(values[1]))
			inAmt := int64(math.Round(values[3]))
			outAmt := int64(math.Round(values[5]))
			outCost := int64(math.Round(values[6]))
			wasteCost := int64(math.Round(values[8]))
			closingAmt := int64(math.Round(values[10]))

			rows = append(rows, []any{
				s.ProductName,
				s.CategoryPath.String,
				s.ProductUnit,
				export.Number(values[0]), export.Money(openingAmt),
				export.Number(values[2]), export.Money(inAmt),
				export.Number(values[4]), export.Money(outAmt), export.Money(outCost),
				export.Number(values[7]), export.Money(wasteCost),
				export.Number(values[9]), export.Money(closingAmt),
			})
			openingSum += openingAmt
			inSum += inAmt
			outSum += outAmt
			outCostSum += outCost
			wasteCostSum += wasteCost
			closingSum += closingAmt
		}

		// opening and closing are valued at purchase cost (FIFO batches);
		// sales amount is the selling total, sales cost what those units cost
		table := export.Table{
			Title: "Inventory Summary",
			Meta:  export.Filters(export.BSDateRange(params.From, params.To)),
			Columns: []export.Column{
				{Header: "Product", Width: 22},
				{Header: "Category", Width: 18},
				{Header: "Unit", Width: 8},
				{Header: "Opening Qty", Numeric: true, Width: 11},
				{Header: "Opening Value", Money: true, Width: 13},
				{Header: "Purchase Qty", Numeric: true, Width: 11},
				{Header: "Purchase Amt", Money: true, Width: 13},
				{Header: "Sales Qty", Numeric: true, Width: 10},
				{Header: "Sales Amt", Money: true, Width: 13},
				{Header: "Sales Cost", Money: true, Width: 13},
				{Header: "Wastage Qty", Numeric: true, Width: 11},
				{Header: "Wastage Cost", Money: true, Width: 13},
				{Header: "Closing Qty", Numeric: true, Width: 11},
				{Header: "Closing Value", Money: true, Width: 13},
			},
			Rows: rows,
			Totals: []any{
				fmt.Sprintf("Total (%d products)", len(rows)), "", "",
				"", export.Money(openingSum),
				"", export.Money(inSum),
				"", export.Money(outSum), export.Money(outCostSum),
				"", export.Money(wasteCostSum),
				"", export.Money(closingSum),
			},
		}

		if err := export.Write(c, export.Format(params.Format), "inventory-summary", table); err != nil {
			applog.Error(c, handlerExportInventorySummary, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
