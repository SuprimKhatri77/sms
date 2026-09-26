package bankledger

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

const handlerExportBankLedger = "ExportBankLedger"

type ExportBankLedgerParams struct {
	Format        string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	BankAccountID string `form:"account_id" binding:"omitempty,uuid"`
	BankID        string `form:"bank_id" binding:"omitempty,uuid"`
	FromDate      string `form:"from_date" binding:"omitempty,date_format"`
	ToDate        string `form:"to_date" binding:"omitempty,date_format"`
}

// ExportBankLedger downloads every bank ledger entry matching the list's
// filters (not just the loaded pages) as CSV, XLSX or PDF, newest first like
// the list, with debit and credit totals and the net balance.
func ExportBankLedger(queries accountingRepository.BankLedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params ExportBankLedgerParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportBankLedger, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		accountID := utils.ToNullableUUID(params.BankAccountID)
		bankID := utils.ToNullableUUID(params.BankID)

		// the picked bank/account, by name, for the file's filter line
		var bankLabel, accountLabel string
		if bankID.Valid {
			bank, err := queries.GetBankByID(ctx, bankID)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					applog.Warn(c, handlerExportBankLedger, "invalid request",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusBadRequest, types.APIResponse{
						Success: false,
						Message: "Invalid query parameter",
						Code:    constants.InvalidQueryParam,
					})
					return
				}
				applog.Error(c, handlerExportBankLedger, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
			bankLabel = bank.Name
		}
		if accountID.Valid {
			account, err := queries.GetBankAccountByID(ctx, accountID)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					applog.Warn(c, handlerExportBankLedger, "invalid request",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusBadRequest, types.APIResponse{
						Success: false,
						Message: "Invalid query parameter",
						Code:    constants.InvalidQueryParam,
					})
					return
				}
				applog.Error(c, handlerExportBankLedger, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
			accountLabel = accountText(account.AccountName, account.AccountNumber)
		}

		total, err := queries.GetBankLedgerCount(ctx, db.GetBankLedgerCountParams{
			BankAccountID: accountID,
			BankID:        bankID,
			FromDate:      utils.ToNullableDate(params.FromDate),
			ToDate:        utils.ToNullableDate(params.ToDate),
		})
		if err != nil {
			applog.Error(c, handlerExportBankLedger, "failed to process request",
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

		entries, err := queries.ListBankLedger(ctx, db.ListBankLedgerParams{
			Limit:         pgtype.Int4{},
			Offset:        0,
			BankAccountID: accountID,
			BankID:        bankID,
			FromDate:      utils.ToNullableDate(params.FromDate),
			ToDate:        utils.ToNullableDate(params.ToDate),
		})
		if err != nil {
			applog.Error(c, handlerExportBankLedger, "failed to process request",
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
				e.BankName,
				accountText(e.AccountName, e.AccountNumber),
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

		meta := export.Filters(
			export.DateRange(params.FromDate, params.ToDate),
			export.Labelled("Bank", bankLabel),
			export.Labelled("Account", accountLabel),
		)
		meta = append(meta, "Net balance (Cr - Dr): "+export.Rupees(totalCr-totalDr))

		table := export.Table{
			Title: "Bank Ledger",
			Meta:  meta,
			Columns: []export.Column{
				{Header: "Date (BS)", Width: 11},
				{Header: "Date (AD)", Width: 11},
				{Header: "Bank", Width: 22},
				{Header: "Account", Width: 22},
				{Header: "D/C", Width: 5},
				{Header: "Debit", Money: true, Width: 13},
				{Header: "Credit", Money: true, Width: 13},
				{Header: "Narration", Width: 26},
			},
			Rows:   rows,
			Totals: []any{fmt.Sprintf("Total (%d entries)", len(rows)), "", "", "", "", export.Money(totalDr), export.Money(totalCr), ""},
		}

		if err := export.Write(c, export.Format(params.Format), "bank-ledger", table); err != nil {
			applog.Error(c, handlerExportBankLedger, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}

// accountText is an account's name with its number, when it has one.
func accountText(name string, number pgtype.Text) string {
	if number.Valid && number.String != "" {
		return name + " · " + number.String
	}
	return name
}
