package in

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"

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

const handlerExportStockIn = "ExportStockIn"

type ExportStockInParams struct {
	Format     string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	Search     string `form:"search"`
	From       string `form:"from" binding:"omitempty,bs_date"`
	To         string `form:"to" binding:"omitempty,bs_date"`
	SortByRate string `form:"sort_by_rate" binding:"omitempty,oneof=asc desc"`
}

// ExportStockIn downloads every purchase matching the list's filters (not
// just one page) as CSV, XLSX or PDF, in the list's order, with the total
// amount at the bottom.
func ExportStockIn(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportStockInParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportStockIn, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetStockInCount(ctx, db.GetStockInCountParams{
			Search: utils.ToNullableText(params.Search),
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
		})
		if err != nil {
			applog.Error(c, handlerExportStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		if total > export.MaxRows {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Too many rows to export, narrow the filters",
				Code:    constants.ExportTooLarge,
			})
			return
		}

		stockList, err := queries.ListStockIn(ctx, db.ListStockInParams{
			Limit:      pgtype.Int4{},
			Offset:     0,
			Search:     utils.ToNullableText(params.Search),
			From:       utils.ToNullableText(params.From),
			To:         utils.ToNullableText(params.To),
			SortByRate: utils.ToNullableText(params.SortByRate),
		})
		if err != nil {
			applog.Error(c, handlerExportStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(stockList))
		var sum int64
		for _, s := range stockList {
			amount := utils.LineAmount(s.Qty, s.Rate)
			rows = append(rows, []any{
				s.ProductName,
				s.SupplierName,
				s.InvoiceNo.String,
				export.Number(s.Qty),
				s.ProductUnit,
				export.Money(s.Rate),
				export.Money(amount),
				strings.TrimSpace(s.Note.String),
				export.DateFromBS(s.Date),
				s.Date,
			})
			sum += amount
		}

		table := export.Table{
			Title: "Purchase",
			Meta: export.Filters(
				export.BSDateRange(params.From, params.To),
				export.Labelled("Search", params.Search),
				export.Labelled("Rate sort", params.SortByRate),
			),
			Columns: []export.Column{
				{Header: "Product", Width: 20},
				{Header: "Supplier", Width: 20},
				{Header: "Invoice No", Width: 12},
				{Header: "Qty", Numeric: true, Width: 8},
				{Header: "Unit", Width: 8},
				{Header: "Rate", Money: true, Width: 11},
				{Header: "Amount", Money: true, Width: 13},
				{Header: "Note", Width: 20},
				{Header: "Date (AD)", Width: 11},
				{Header: "Date (BS)", Width: 11},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total (%d purchases)", len(rows)), "", "", "", "", "", export.Money(sum), "", "", ""},
		}

		if err := export.Write(c, export.Format(params.Format), "purchases", table); err != nil {
			applog.Error(c, handlerExportStockIn, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
