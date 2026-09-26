package products

import (
	"fmt"
	"log/slog"
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

const handlerExportProducts = "ExportProducts"

type ExportProductsParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	Name   string `form:"name"`
	From   string `form:"from" binding:"omitempty,date_format"`
	To     string `form:"to" binding:"omitempty,date_format"`
}

// ExportProducts downloads every product matching the list's filters (not
// just one page) as CSV, XLSX or PDF.
func ExportProducts(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportProductsParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportProducts, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetProductCount(ctx, db.GetProductCountParams{
			Name: utils.ToNullableText(params.Name),
			From: utils.ToNullableDate(params.From),
			To:   utils.ToNullableDate(params.To),
		})
		if err != nil {
			applog.Error(c, handlerExportProducts, "failed to process request",
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

		products, err := queries.ListProducts(ctx, db.ListProductsParams{
			Limit:  pgtype.Int4{},
			Offset: 0,
			Name:   utils.ToNullableText(params.Name),
			From:   utils.ToNullableDate(params.From),
			To:     utils.ToNullableDate(params.To),
		})
		if err != nil {
			applog.Error(c, handlerExportProducts, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(products))
		for _, p := range products {
			rows = append(rows, []any{
				p.Name,
				p.Unit,
				export.DateAD(p.CreatedAt.Time),
				export.DateBS(p.CreatedAt.Time),
			})
		}

		table := export.Table{
			Title: "Products",
			Meta: export.Filters(
				export.DateRange(params.From, params.To),
				export.Labelled("Name", params.Name),
			),
			Columns: []export.Column{
				{Header: "Name", Width: 32},
				{Header: "Unit", Width: 14},
				{Header: "Created (AD)", Width: 14},
				{Header: "Created (BS)", Width: 14},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total: %d products", len(rows)), "", "", ""},
		}

		if err := export.Write(c, export.Format(params.Format), "products", table); err != nil {
			applog.Error(c, handlerExportProducts, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
