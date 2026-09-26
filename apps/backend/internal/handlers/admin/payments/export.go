package payments

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

type ExportPaymentsParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	From   string `form:"from" binding:"omitempty,date_format"`
	To     string `form:"to" binding:"omitempty,date_format"`
	Search string `form:"search" binding:"omitempty,min=1,max=100"`
}

const handlerExportPayments = "ExportPayments"

// ExportPayments downloads every payment matching the list's filters (not
// just one page) as CSV, XLSX or PDF, with the total amount at the bottom.
func ExportPayments(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportPaymentsParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportPayments, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetAllPaymentsCount(ctx, db.GetAllPaymentsCountParams{
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportPayments, "failed to process request",
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

		payments, err := queries.GetAllPayments(ctx, db.GetAllPaymentsParams{
			Limit:  pgtype.Int4{},
			Offset: 0,
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportPayments, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(payments))
		var sum int64
		for _, p := range payments {
			rows = append(rows, []any{
				p.ReferenceNo,
				p.FullName,
				p.Phone,
				export.Money(p.Amount),
				paymentModeLabel(p.PaymentMode),
				strings.TrimSpace(p.Remarks.String),
				export.DateAD(p.Date.Time),
				// the BS date the admin entered, rather than one recomputed from date
				p.BsDate,
			})
			sum += int64(p.Amount)
		}

		table := export.Table{
			Title: "Student Payments",
			Meta: export.Filters(
				export.DateRange(params.From, params.To),
				export.Labelled("Search", params.Search),
			),
			Columns: []export.Column{
				{Header: "Ref No", Width: 14},
				{Header: "Name", Width: 24},
				{Header: "Phone", Width: 14},
				{Header: "Amount", Money: true, Width: 14},
				{Header: "Mode", Width: 12},
				{Header: "Remarks", Width: 28},
				{Header: "Date (AD)", Width: 12},
				{Header: "Date (BS)", Width: 12},
			},
			Rows:   rows,
			Totals: []any{"Total", fmt.Sprintf("%d payments", len(rows)), "", export.Money(sum), "", "", "", ""},
		}

		if err := export.Write(c, export.Format(params.Format), "student-payments", table); err != nil {
			applog.Error(c, handlerExportPayments, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}

// paymentModeLabel mirrors the frontend's formatPaymentMode for a list row,
// where the cash/bank split isn't loaded.
func paymentModeLabel(mode string) string {
	if strings.EqualFold(mode, "cash_and_bank") {
		return "Cash + Bank"
	}
	return mode
}
