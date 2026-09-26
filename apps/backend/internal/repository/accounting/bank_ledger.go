package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type BankLedgerRepository interface {
	CreateBankLedgerEntry(ctx context.Context, params db.CreateBankLedgerEntryParams) (db.BankLedger, error)
	GetBankLedgerSummary(ctx context.Context, params db.GetBankLedgerSummaryParams) (db.GetBankLedgerSummaryRow, error)
	ListBankLedger(ctx context.Context, params db.ListBankLedgerParams) ([]db.ListBankLedgerRow, error)
	GetBankByID(ctx context.Context, id pgtype.UUID) (db.Bank, error)
	GetBankAccountByID(ctx context.Context, id pgtype.UUID) (db.GetBankAccountByIDRow, error)
	GetBankLedgerCount(ctx context.Context, params db.GetBankLedgerCountParams) (int64, error)
}
