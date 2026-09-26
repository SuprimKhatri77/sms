package wastage

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

const handlerExportWastage = "ExportWastage"

type ExportWastageParams struct {
	Format      string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	ProductName string `form:"product_name"`
	From        string `form:"from" binding:"omitempty,bs_date"`
	To          string `form:"to" binding:"omitempty,bs_date"`
	SortByRate  string `form:"sort_by_rate" binding:"omitempty,oneof=asc desc"`
}

// ExportWastage downloads every wastage entry matching the list's filters
// (not just one page) as CSV, XLSX or PDF, in the list's order, with the
// total amount at the bottom.
func ExportWastage(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportWastageParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportWastage, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetWastageCount(ctx, db.GetWastageCountParams{
			ProductName: utils.ToNullableText(params.ProductName),
			From:        utils.ToNullableText(params.From),
			To:          utils.ToNullableText(params.To),
		})
		if err != nil {
			applog.Error(c, handlerExportWastage, "failed to process request",
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

		wastageList, err := queries.ListWastage(ctx, db.ListWastageParams{
			Limit:       pgtype.Int4{},
			Offset:      0,
			ProductName: utils.ToNullableText(params.ProductName),
			From:        utils.ToNullableText(params.From),
			To:          utils.ToNullableText(params.To),
			SortByRate:  utils.ToNullableText(params.SortByRate),
		})
		if err != nil {
			applog.Error(c, handlerExportWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(wastageList))
		var sum int64
		for _, w := range wastageList {
			amount := utils.LineAmount(w.Qty, w.Rate)
			rows = append(rows, []any{
				w.ProductName,
				export.Number(w.Qty),
				w.ProductUnit,
				export.Money(w.Rate),
				export.Money(amount),
				strings.TrimSpace(w.Reason.String),
				export.DateFromBS(w.Date),
				w.Date,
			})
			sum += amount
		}

		table := export.Table{
			Title: "Wastage",
			Meta: export.Filters(
				export.BSDateRange(params.From, params.To),
				export.Labelled("Product", params.ProductName),
				export.Labelled("Rate sort", params.SortByRate),
			),
			Columns: []export.Column{
				{Header: "Product", Width: 24},
				{Header: "Qty", Numeric: true, Width: 8},
				{Header: "Unit", Width: 8},
				{Header: "Rate", Money: true, Width: 11},
				{Header: "Amount", Money: true, Width: 13},
				{Header: "Reason", Width: 28},
				{Header: "Date (AD)", Width: 11},
				{Header: "Date (BS)", Width: 11},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total (%d entries)", len(rows)), "", "", "", export.Money(sum), "", "", ""},
		}

		if err := export.Write(c, export.Format(params.Format), "wastage", table); err != nil {
			applog.Error(c, handlerExportWastage, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
