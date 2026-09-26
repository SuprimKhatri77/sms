package cashledger

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
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerExportCashLedger = "ExportCashLedger"

type ExportCashLedgerParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	FromAD string `form:"from_ad" binding:"omitempty,date_format"`
	ToAD   string `form:"to_ad" binding:"omitempty,date_format"`
}

// ExportCashLedger downloads every cash ledger entry matching the list's
// filters (not just the loaded pages) as CSV, XLSX or PDF, newest first like
// the list, with debit and credit totals and the net balance.
func ExportCashLedger(queries accountingRepository.CashLedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportCashLedgerParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportCashLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetCashLedgerCount(ctx, db.GetCashLedgerCountParams{
			FromDate: utils.ToNullableDate(params.FromAD),
			ToDate:   utils.ToNullableDate(params.ToAD),
		})
		if err != nil {
			applog.Error(c, handlerExportCashLedger, "failed to process request",
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

		entries, err := queries.ListCashLedger(ctx, db.ListCashLedgerParams{
			Limit:    pgtype.Int4{},
			Offset:   0,
			FromDate: utils.ToNullableDate(params.FromAD),
			ToDate:   utils.ToNullableDate(params.ToAD),
		})
		if err != nil {
			applog.Error(c, handlerExportCashLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(entries))
		var totalDr, totalCr int64
		for _, e := range entries {
			debit, credit := export.DebitCredit(e.EntryType, e.Amount)
			rows = append(rows, []any{
				e.BsDate,
				export.DateAD(e.Date.Time),
				export.EntryTypeLabel(e.EntryType),
				debit,
				credit,
				strings.TrimSpace(e.Description.String),
			})
			if e.EntryType == "dr" {
				totalDr += e.Amount
			} else {
				totalCr += e.Amount
			}
		}

		meta := export.Filters(export.DateRange(params.FromAD, params.ToAD))
		meta = append(meta, "Net balance (Cr - Dr): "+export.Rupees(totalCr-totalDr))

		table := export.Table{
			Title: "Cash Ledger",
			Meta:  meta,
			Columns: []export.Column{
				{Header: "Date (BS)", Width: 11},
				{Header: "Date (AD)", Width: 11},
				{Header: "D/C", Width: 5},
				{Header: "Debit", Money: true, Width: 13},
				{Header: "Credit", Money: true, Width: 13},
				{Header: "Narration", Width: 40},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total (%d entries)", len(rows)), "", "", export.Money(totalDr), export.Money(totalCr), ""},
		}

		if err := export.Write(c, export.Format(params.Format), "cash-ledger", table); err != nil {
			applog.Error(c, handlerExportCashLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
