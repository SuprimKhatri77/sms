package ledger

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
	ledgertypes "github.com/suprimkhatri77/sms/backend/internal/pkg/ledger"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerExportLedgerEntries = "ExportLedgerEntries"

type ExportLedgerParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	LedgerFilterParams
}

// accountText is an account's name with its number, when it has one.
func accountText(name string, number pgtype.Text) string {
	if number.Valid && number.String != "" {
		return name + " · " + number.String
	}
	return name
}

// partyText is who an entry is with: the supplier, or the bank and account.
func partyText(e db.ListLedgerEntriesRow) string {
	switch {
	case e.SupplierName.Valid:
		return e.SupplierName.String
	case e.BankName.Valid:
		return e.BankName.String + " · " + accountText(e.AccountName.String, e.AccountNumber)
	}
	return ""
}

// balanceLine words a ledger's Cr − Dr the way its summary card does: what's
// still owed for suppliers (negative = overpaid), the net balance otherwise.
func balanceLine(row db.GetLedgerSummaryRow) string {
	label := ledgertypes.Types[row.LedgerType].Label
	if row.LedgerType == ledgertypes.TypeSupplier {
		if row.Balance < 0 {
			return label + " overpaid: " + export.Rupees(-row.Balance)
		}
		return label + " payable balance: " + export.Rupees(row.Balance)
	}
	return label + " net balance (Cr - Dr): " + export.Rupees(row.Balance)
}

// ExportLedgerEntries downloads every entry matching the list's filters (not
// just the loaded pages) as CSV, XLSX or PDF, newest first like the list,
// with debit and credit totals and each ledger's balance.
func ExportLedgerEntries(queries accountingRepository.LedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportLedgerParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportLedgerEntries, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}
		filter := params.LedgerFilterParams

		// a picked filter that doesn't exist is a bad request; anything else
		// failing is ours
		respondErr := func(err error) {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerExportLedgerEntries, "invalid request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid query parameter",
					Code:    constants.InvalidQueryParam,
				})
				return
			}
			applog.Error(c, handlerExportLedgerEntries, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}

		// the picked filters, by name, for the file's filter line
		var supplierLabel, bankLabel, accountLabel, groupLabel string
		if id := utils.ToNullableUUID(filter.SupplierID); id.Valid {
			supplier, err := queries.GetSupplierByID(ctx, id)
			if err != nil {
				respondErr(err)
				return
			}
			supplierLabel = supplier.CompanyName
		}
		if id := utils.ToNullableUUID(filter.BankID); id.Valid {
			bank, err := queries.GetBankByID(ctx, id)
			if err != nil {
				respondErr(err)
				return
			}
			bankLabel = bank.Name
		}
		if id := utils.ToNullableUUID(filter.BankAccountID); id.Valid {
			account, err := queries.GetBankAccountByID(ctx, id)
			if err != nil {
				respondErr(err)
				return
			}
			accountLabel = accountText(account.AccountName, account.AccountNumber)
		}
		if id := utils.ToNullableUUID(filter.AccountGroupID); id.Valid {
			group, err := queries.GetAccountGroupByID(ctx, id)
			if err != nil {
				respondErr(err)
				return
			}
			groupLabel = group.Name
		}

		total, err := queries.GetLedgerEntryCount(ctx, filter.countParams())
		if err != nil {
			respondErr(err)
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

		entries, err := queries.ListLedgerEntries(ctx, filter.listParams(pgtype.Int4{}, 0))
		if err != nil {
			respondErr(err)
			return
		}
		summary, err := queries.GetLedgerSummary(ctx, filter.summaryParams())
		if err != nil {
			respondErr(err)
			return
		}

		rows := make([][]any, 0, len(entries))
		var totalDr, totalCr int64
		for _, e := range entries {
			debit, credit := export.DebitCredit(e.EntryType, e.Amount)
			rows = append(rows, []any{
				e.BsDate,
				export.DateAD(e.Date.Time),
				ledgertypes.Types[e.LedgerType].Label,
				partyText(e),
				e.AccountGroupName.String,
				e.PaymentType.String,
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

		title := "Ledgers"
		if filter.LedgerType != "" {
			title = ledgertypes.Types[filter.LedgerType].Label + " Ledger"
		}
		meta := export.Filters(
			export.DateRange(filter.FromDate, filter.ToDate),
			export.Labelled("Supplier", supplierLabel),
			export.Labelled("Bank", bankLabel),
			export.Labelled("Account", accountLabel),
			export.Labelled("Account group", groupLabel),
		)
		for _, row := range fillLedgerSummary(filter.LedgerType, summary) {
			meta = append(meta, balanceLine(row))
		}

		table := export.Table{
			Title: title,
			Meta:  meta,
			Columns: []export.Column{
				{Header: "Date (BS)", Width: 11},
				{Header: "Date (AD)", Width: 11},
				{Header: "Ledger", Width: 9},
				{Header: "Party", Width: 22},
				{Header: "Account Group", Width: 16},
				{Header: "Payment Type", Width: 11},
				{Header: "D/C", Width: 5},
				{Header: "Debit", Money: true, Width: 13},
				{Header: "Credit", Money: true, Width: 13},
				{Header: "Narration", Width: 26},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total (%d entries)", len(rows)), "", "", "", "", "", "", export.Money(totalDr), export.Money(totalCr), ""},
		}

		baseName := "ledgers"
		if filter.LedgerType != "" {
			baseName = filter.LedgerType + "-ledger"
		}
		if err := export.Write(c, export.Format(params.Format), baseName, table); err != nil {
			applog.Error(c, handlerExportLedgerEntries, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}
