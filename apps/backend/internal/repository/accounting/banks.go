package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type BankRepository interface {
	CreateBank(ctx context.Context, name string) (db.Bank, error)
	UpdateBank(ctx context.Context, params db.UpdateBankParams) (db.Bank, error)
	DeleteBank(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	ListBanks(ctx context.Context, params db.ListBanksParams) ([]db.Bank, error)
	GetBanksCount(ctx context.Context, name pgtype.Text) (int64, error)
	GetBankByID(ctx context.Context, id pgtype.UUID) (db.Bank, error)
}

type BankTxRepository interface {
	WithTx(tx pgx.Tx) BankTxRepository
	UnsetDefaultBank(ctx context.Context) error
	SetBankAsDefault(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)

	IsBankDefault(ctx context.Context, id pgtype.UUID) (bool, error)
}

type bankTxRepository struct {
	queries *db.Queries
	pool    *pgxpool.Pool
}

func NewBankTxRepository(queries *db.Queries) BankTxRepository {
	return &bankTxRepository{queries: queries}
}

func (r *bankTxRepository) WithTx(tx pgx.Tx) BankTxRepository {
	return &bankTxRepository{queries: r.queries.WithTx(tx), pool: r.pool}
}

func (r *bankTxRepository) UnsetDefaultBank(ctx context.Context) error {
	return r.queries.UnsetDefaultBank(ctx)
}
func (r *bankTxRepository) SetBankAsDefault(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error) {
	return r.queries.SetBankAsDefault(ctx, id)
}

func (r *bankTxRepository) IsBankDefault(ctx context.Context, id pgtype.UUID) (bool, error) {
	return r.queries.IsBankDefault(ctx, id)
}
