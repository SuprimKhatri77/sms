package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type BankAccountRepository interface {
	CreateBankAccount(ctx context.Context, params db.CreateBankAccountParams) (db.BankAccount, error)
	UpdateBankAccount(ctx context.Context, params db.UpdateBankAccountParams) (pgconn.CommandTag, error)
	DeleteBankAccount(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	ListBankAccounts(ctx context.Context, params db.ListBankAccountsParams) ([]db.ListBankAccountsRow, error)
	GetBankAccountsCount(ctx context.Context) (int64, error)
	IsBankAccountDefault(ctx context.Context, id pgtype.UUID) (bool, error)
	ListBankAccountsForDropdown(ctx context.Context, params db.ListBankAccountsForDropdownParams) ([]db.ListBankAccountsForDropdownRow, error)
}

type BankAccountTxRepository interface {
	WithTx(tx pgx.Tx) BankAccountTxRepository
	UnsetDefaultBankAccount(ctx context.Context) error
	SetBankAccountAsDefault(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	IsBankAccountDefault(ctx context.Context, id pgtype.UUID) (bool, error)
}

type bankAccountTxRepository struct {
	queries *db.Queries
	pool    *pgxpool.Pool
}

func NewBankAccountTxRepository(queries *db.Queries) BankAccountTxRepository {
	return &bankAccountTxRepository{queries: queries}
}

func (r *bankAccountTxRepository) WithTx(tx pgx.Tx) BankAccountTxRepository {
	return &bankAccountTxRepository{queries: r.queries.WithTx(tx), pool: r.pool}
}

func (b *bankAccountTxRepository) UnsetDefaultBankAccount(ctx context.Context) error {
	return b.queries.UnsetDefaultBankAccount(ctx)
}
func (b *bankAccountTxRepository) SetBankAccountAsDefault(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error) {
	return b.queries.SetBankAccountAsDefault(ctx, id)
}

func (b *bankAccountTxRepository) IsBankAccountDefault(ctx context.Context, id pgtype.UUID) (bool, error) {
	return b.queries.IsBankAccountDefault(ctx, id)
}
