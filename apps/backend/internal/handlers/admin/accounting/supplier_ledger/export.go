package supplierledger

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/export"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerExportSupplierLedger = "ExportSupplierLedger"

type ExportSupplierLedgerParams struct {
	Format     string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	SupplierID string `form:"supplier_id" binding:"omitempty,uuid"`
	FromDate   string `form:"from_date" binding:"omitempty,date_format"`
	ToDate     string `form:"to_date" binding:"omitempty,date_format"`
}

// ExportSupplierLedger downloads every supplier ledger entry matching the
// list's filters (not just the loaded pages) as CSV, XLSX or PDF, newest
// first like the list, with debit and credit totals and the payable balance.
func ExportSupplierLedger(queries accountingRepository.SupplierLedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportSupplierLedgerParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportSupplierLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		supplierID := utils.ToNullableUUID(params.SupplierID)

		// the picked supplier, by name, for the file's filter line
		var supplierLabel string
		if supplierID.Valid {
			supplier, err := queries.GetSupplierByID(ctx, supplierID)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					applog.Warn(c, handlerExportSupplierLedger, "invalid request",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusBadRequest, types.APIResponse{
						Success: false,
						Message: "Invalid query parameter",
						Code:    constants.InvalidQueryParam,
					})
					return
				}
				applog.Error(c, handlerExportSupplierLedger, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
			supplierLabel = supplier.CompanyName
		}

		total, err := queries.GetSupplierLedgerCount(ctx, db.GetSupplierLedgerCountParams{
			SupplierID: supplierID,
			FromDate:   utils.ToNullableDate(params.FromDate),
			ToDate:     utils.ToNullableDate(params.ToDate),
		})
		if err != nil {
			applog.Error(c, handlerExportSupplierLedger, "failed to process request",
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

		entries, err := queries.ListSupplierLedger(ctx, db.ListSupplierLedgerParams{
			Limit:      pgtype.Int4{},
			Offset:     0,
			SupplierID: supplierID,
			FromDate:   utils.ToNullableDate(params.FromDate),
			ToDate:     utils.ToNullableDate(params.ToDate),
		})
		if err != nil {
			applog.Error(c, handlerExportSupplierLedger, "failed to process request",
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
				e.SupplierName,
				e.PaymentType,
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

		// worded like the page's summary card: Cr − Dr is what's still owed
		// to suppliers, and a negative balance means they were overpaid
		balance := totalCr - totalDr
		balanceLine := "Payable balance: " + export.Rupees(balance)
		if balance < 0 {
			balanceLine = "Overpaid: " + export.Rupees(-balance)
		}

		meta := export.Filters(
			export.DateRange(params.FromDate, params.ToDate),
			export.Labelled("Supplier", supplierLabel),
		)
		meta = append(meta, balanceLine)

		table := export.Table{
			Title: "Supplier Ledger",
			Meta:  meta,
			Columns: []export.Column{
				{Header: "Date (BS)", Width: 11},
				{Header: "Date (AD)", Width: 11},
				{Header: "Supplier", Width: 22},
				{Header: "Payment Type", Width: 12},
				{Header: "D/C", Width: 5},
				{Header: "Debit", Money: true, Width: 13},
				{Header: "Credit", Money: true, Width: 13},
				{Header: "Narration", Width: 30},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total (%d entries)", len(rows)), "", "", "", "", export.Money(totalDr), export.Money(totalCr), ""},
		}

		if err := export.Write(c, export.Format(params.Format), "supplier-ledger", table); err != nil {
			applog.Error(c, handlerExportSupplierLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
