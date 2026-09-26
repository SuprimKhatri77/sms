package out

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

const handlerExportStockOut = "ExportStockOut"

type ExportStockOutParams struct {
	Format     string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	Search     string `form:"search"`
	From       string `form:"from" binding:"omitempty,bs_date"`
	To         string `form:"to" binding:"omitempty,bs_date"`
	SortByRate string `form:"sort_by_rate" binding:"omitempty,oneof=asc desc"`
}

// ExportStockOut downloads every sale matching the list's filters (not just
// one page) as CSV, XLSX or PDF, in the list's order, with the total amount
// at the bottom.
func ExportStockOut(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportStockOutParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportStockOut, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetStockOutCount(ctx, db.GetStockOutCountParams{
			Search: utils.ToNullableText(params.Search),
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
		})
		if err != nil {
			applog.Error(c, handlerExportStockOut, "failed to process request",
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

		stockOutList, err := queries.ListStockOut(ctx, db.ListStockOutParams{
			Limit:      pgtype.Int4{},
			Offset:     0,
			Search:     utils.ToNullableText(params.Search),
			From:       utils.ToNullableText(params.From),
			To:         utils.ToNullableText(params.To),
			SortByRate: utils.ToNullableText(params.SortByRate),
		})
		if err != nil {
			applog.Error(c, handlerExportStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(stockOutList))
		var sum int64
		for _, s := range stockOutList {
			amount := utils.LineAmount(s.Qty, s.Rate)
			rows = append(rows, []any{
				s.ProductName,
				s.BillNo.String,
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
			Title: "Sales",
			Meta: export.Filters(
				export.BSDateRange(params.From, params.To),
				export.Labelled("Search", params.Search),
				export.Labelled("Rate sort", params.SortByRate),
			),
			Columns: []export.Column{
				{Header: "Product", Width: 22},
				{Header: "Bill No", Width: 12},
				{Header: "Qty", Numeric: true, Width: 8},
				{Header: "Unit", Width: 8},
				{Header: "Rate", Money: true, Width: 11},
				{Header: "Amount", Money: true, Width: 13},
				{Header: "Note", Width: 24},
				{Header: "Date (AD)", Width: 11},
				{Header: "Date (BS)", Width: 11},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total (%d sales)", len(rows)), "", "", "", "", export.Money(sum), "", "", ""},
		}

		if err := export.Write(c, export.Format(params.Format), "sales", table); err != nil {
			applog.Error(c, handlerExportStockOut, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
