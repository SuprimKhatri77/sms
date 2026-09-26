package discount

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
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

type ExportAllDiscountsParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	From   string `form:"from" binding:"omitempty,date_format"`
	To     string `form:"to" binding:"omitempty,date_format"`
	Search string `form:"search" binding:"omitempty,min=1,max=100"`
}

const handlerExportAllDiscounts = "ExportAllDiscounts"

// ExportAllStudentDiscounts downloads every discount matching the list's
// filters (not just one page) as CSV, XLSX or PDF, with the total amount at
// the bottom.
func ExportAllStudentDiscounts(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportAllDiscountsParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportAllDiscounts, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetAllStudentDiscountsCount(ctx, db.GetAllStudentDiscountsCountParams{
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportAllDiscounts, "failed to process request",
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

		discounts, err := queries.GetAllStudentDiscounts(ctx, db.GetAllStudentDiscountsParams{
			Limit:  pgtype.Int4{},
			Offset: 0,
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportAllDiscounts, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(discounts))
		var sum int64
		for _, d := range discounts {
			percent, err := discountPercentLabel(d.Mode, d.Percent)
			if err != nil {
				applog.Error(c, handlerExportAllDiscounts, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}

			rows = append(rows, []any{
				d.ReferenceNo,
				d.FullName,
				d.Type,
				percent,
				export.Money(d.Amount),
				strings.TrimSpace(d.Note.String),
				export.DateAD(d.CreatedAt.Time),
				export.DateBS(d.CreatedAt.Time),
			})
			sum += d.Amount
		}

		table := export.Table{
			Title: "Student Discounts",
			Meta: export.Filters(
				export.DateRange(params.From, params.To),
				export.Labelled("Search", params.Search),
			),
			Columns: []export.Column{
				{Header: "Ref No", Width: 14},
				{Header: "Name", Width: 24},
				{Header: "Type", Width: 14},
				{Header: "Percent", Width: 9},
				{Header: "Amount", Money: true, Width: 14},
				{Header: "Note", Width: 28},
				{Header: "Date (AD)", Width: 12},
				{Header: "Date (BS)", Width: 12},
			},
			Rows:   rows,
			Totals: []any{"Total", fmt.Sprintf("%d discounts", len(rows)), "", "", export.Money(sum), "", "", ""},
		}

		if err := export.Write(c, export.Format(params.Format), "student-discounts", table); err != nil {
			applog.Error(c, handlerExportAllDiscounts, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}

// discountPercentLabel mirrors the frontend's formatDiscountPercent: a
// flat-amount discount's percent is only a snapshot, so it reads "Flat".
func discountPercentLabel(mode string, percent pgtype.Numeric) (string, error) {
	if mode == "amount" {
		return "Flat", nil
	}
	f, err := utils.NumericToFloat64(percent)
	if err != nil {
		return "", err
	}
	return strconv.FormatFloat(f, 'f', -1, 64) + "%", nil
}
