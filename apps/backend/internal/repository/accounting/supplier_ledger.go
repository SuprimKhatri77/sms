package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type SupplierLedgerRepository interface {
	CreateSupplierLedgerEntry(ctx context.Context, params db.CreateSupplierLedgerEntryParams) (db.SupplierLedger, error)
	ListSupplierLedger(ctx context.Context, params db.ListSupplierLedgerParams) ([]db.ListSupplierLedgerRow, error)
	GetSupplierLedgerSummary(ctx context.Context, params db.GetSupplierLedgerSummaryParams) (db.GetSupplierLedgerSummaryRow, error)
	GetSupplierLedgerCount(ctx context.Context, params db.GetSupplierLedgerCountParams) (int64, error)
}

type SupplierLedgerTxRepository interface {
	WithTx(tx pgx.Tx) SupplierLedgerTxRepository
	GetSupplierByID(ctx context.Context, id pgtype.UUID) (db.Supplier, error)
	CreateSupplierLedgerEntry(ctx context.Context, params db.CreateSupplierLedgerEntryParams) (db.SupplierLedger, error)
	CreateCashLedgerEntry(ctx context.Context, params db.CreateCashLedgerEntryParams) (db.CashLedger, error)
	CreateBankLedgerEntry(ctx context.Context, params db.CreateBankLedgerEntryParams) (db.BankLedger, error)
	GetDefaultBankAccountID(ctx context.Context) (pgtype.UUID, error)
}

type supplierLedgerTxRepository struct {
	queries *db.Queries
	pool    *pgxpool.Pool
}

func NewSupplierLedgerTxRepository(queries *db.Queries, pool *pgxpool.Pool) SupplierLedgerTxRepository {
	return &supplierLedgerTxRepository{queries: queries, pool: pool}
}

func (r *supplierLedgerTxRepository) WithTx(tx pgx.Tx) SupplierLedgerTxRepository {
	return &supplierLedgerTxRepository{queries: r.queries.WithTx(tx), pool: r.pool}
}

func (r *supplierLedgerTxRepository) GetSupplierByID(ctx context.Context, id pgtype.UUID) (db.Supplier, error) {
	return r.queries.GetSupplierByID(ctx, id)
}

func (r *supplierLedgerTxRepository) CreateSupplierLedgerEntry(ctx context.Context, params db.CreateSupplierLedgerEntryParams) (db.SupplierLedger, error) {
	return r.queries.CreateSupplierLedgerEntry(ctx, params)
}

func (r *supplierLedgerTxRepository) CreateCashLedgerEntry(ctx context.Context, params db.CreateCashLedgerEntryParams) (db.CashLedger, error) {
	return r.queries.CreateCashLedgerEntry(ctx, params)
}

func (r *supplierLedgerTxRepository) CreateBankLedgerEntry(ctx context.Context, params db.CreateBankLedgerEntryParams) (db.BankLedger, error) {
	return r.queries.CreateBankLedgerEntry(ctx, params)
}

func (r *supplierLedgerTxRepository) GetDefaultBankAccountID(ctx context.Context) (pgtype.UUID, error) {
	return r.queries.GetDefaultBankAccountID(ctx)
}
