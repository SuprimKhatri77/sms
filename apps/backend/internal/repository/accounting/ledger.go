package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type LedgerRepository interface {
	ListLedgerEntries(ctx context.Context, params db.ListLedgerEntriesParams) ([]db.ListLedgerEntriesRow, error)
	GetLedgerEntryCount(ctx context.Context, params db.GetLedgerEntryCountParams) (int64, error)
	GetLedgerSummary(ctx context.Context, params db.GetLedgerSummaryParams) ([]db.GetLedgerSummaryRow, error)
	GetBankByID(ctx context.Context, id pgtype.UUID) (db.Bank, error)
	GetBankAccountByID(ctx context.Context, id pgtype.UUID) (db.GetBankAccountByIDRow, error)
	GetSupplierByID(ctx context.Context, id pgtype.UUID) (db.Supplier, error)
	GetAccountGroupByID(ctx context.Context, id pgtype.UUID) (db.AccountGroup, error)
}

type LedgerTxRepository interface {
	WithTx(tx pgx.Tx) LedgerTxRepository
	GetSupplierByID(ctx context.Context, id pgtype.UUID) (db.Supplier, error)
	GetDefaultBankAccountID(ctx context.Context) (pgtype.UUID, error)
	CreateLedgerEntry(ctx context.Context, params db.CreateLedgerEntryParams) (db.LedgerEntry, error)
	GetLedgerEntryByID(ctx context.Context, id pgtype.UUID) (db.GetLedgerEntryByIDRow, error)
	GetLedgerEntryForUpdate(ctx context.Context, id pgtype.UUID) (db.LedgerEntry, error)
	GetPairedLedgerEntry(ctx context.Context, pairedEntryID pgtype.UUID) (db.LedgerEntry, error)
	UpdateLedgerEntry(ctx context.Context, params db.UpdateLedgerEntryParams) (db.LedgerEntry, error)
	DeleteLedgerEntry(ctx context.Context, id pgtype.UUID) error
	DeletePairedLedgerEntry(ctx context.Context, pairedEntryID pgtype.UUID) error
}

type ledgerTxRepository struct {
	queries *db.Queries
	pool    *pgxpool.Pool
}

func NewLedgerTxRepository(queries *db.Queries, pool *pgxpool.Pool) LedgerTxRepository {
	return &ledgerTxRepository{queries: queries, pool: pool}
}

func (r *ledgerTxRepository) WithTx(tx pgx.Tx) LedgerTxRepository {
	return &ledgerTxRepository{queries: r.queries.WithTx(tx), pool: r.pool}
}

func (r *ledgerTxRepository) GetSupplierByID(ctx context.Context, id pgtype.UUID) (db.Supplier, error) {
	return r.queries.GetSupplierByID(ctx, id)
}

func (r *ledgerTxRepository) GetDefaultBankAccountID(ctx context.Context) (pgtype.UUID, error) {
	return r.queries.GetDefaultBankAccountID(ctx)
}

func (r *ledgerTxRepository) CreateLedgerEntry(ctx context.Context, params db.CreateLedgerEntryParams) (db.LedgerEntry, error) {
	return r.queries.CreateLedgerEntry(ctx, params)
}

func (r *ledgerTxRepository) GetLedgerEntryByID(ctx context.Context, id pgtype.UUID) (db.GetLedgerEntryByIDRow, error) {
	return r.queries.GetLedgerEntryByID(ctx, id)
}

func (r *ledgerTxRepository) GetLedgerEntryForUpdate(ctx context.Context, id pgtype.UUID) (db.LedgerEntry, error) {
	return r.queries.GetLedgerEntryForUpdate(ctx, id)
}

func (r *ledgerTxRepository) GetPairedLedgerEntry(ctx context.Context, pairedEntryID pgtype.UUID) (db.LedgerEntry, error) {
	return r.queries.GetPairedLedgerEntry(ctx, pairedEntryID)
}

func (r *ledgerTxRepository) UpdateLedgerEntry(ctx context.Context, params db.UpdateLedgerEntryParams) (db.LedgerEntry, error) {
	return r.queries.UpdateLedgerEntry(ctx, params)
}

func (r *ledgerTxRepository) DeleteLedgerEntry(ctx context.Context, id pgtype.UUID) error {
	return r.queries.DeleteLedgerEntry(ctx, id)
}

func (r *ledgerTxRepository) DeletePairedLedgerEntry(ctx context.Context, pairedEntryID pgtype.UUID) error {
	return r.queries.DeletePairedLedgerEntry(ctx, pairedEntryID)
}
