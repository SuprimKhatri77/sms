package ledger

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

// LedgerFilterParams are the filters shared by the list, summary and export.
// The IDs are checked as UUIDs because utils.ToNullableUUID turns a malformed
// one into "no filter", which would silently show everything.
type LedgerFilterParams struct {
	LedgerType     string `form:"type" binding:"omitempty,oneof=cash bank supplier salary"`
	SupplierID     string `form:"supplier_id" binding:"omitempty,uuid"`
	EmployeeID     string `form:"employee_id" binding:"omitempty,uuid"`
	BankID         string `form:"bank_id" binding:"omitempty,uuid"`
	BankAccountID  string `form:"account_id" binding:"omitempty,uuid"`
	AccountGroupID string `form:"account_group_id" binding:"omitempty,uuid"`
	FromDate       string `form:"from_date" binding:"omitempty,date_format"`
	ToDate         string `form:"to_date" binding:"omitempty,date_format"`
}

func (f LedgerFilterParams) countParams() db.GetLedgerEntryCountParams {
	return db.GetLedgerEntryCountParams{
		LedgerType:     utils.ToNullableText(f.LedgerType),
		SupplierID:     utils.ToNullableUUID(f.SupplierID),
		EmployeeID:     utils.ToNullableUUID(f.EmployeeID),
		BankID:         utils.ToNullableUUID(f.BankID),
		BankAccountID:  utils.ToNullableUUID(f.BankAccountID),
		AccountGroupID: utils.ToNullableUUID(f.AccountGroupID),
		FromDate:       utils.ToNullableDate(f.FromDate),
		ToDate:         utils.ToNullableDate(f.ToDate),
	}
}

// listParams with a null limit lists every matching entry.
func (f LedgerFilterParams) listParams(limit pgtype.Int4, offset int32) db.ListLedgerEntriesParams {
	p := f.countParams()
	return db.ListLedgerEntriesParams{
		LedgerType:     p.LedgerType,
		SupplierID:     p.SupplierID,
		EmployeeID:     p.EmployeeID,
		BankID:         p.BankID,
		BankAccountID:  p.BankAccountID,
		AccountGroupID: p.AccountGroupID,
		FromDate:       p.FromDate,
		ToDate:         p.ToDate,
		Offset:         offset,
		Limit:          limit,
	}
}

func (f LedgerFilterParams) summaryParams() db.GetLedgerSummaryParams {
	return db.GetLedgerSummaryParams(f.countParams())
}
