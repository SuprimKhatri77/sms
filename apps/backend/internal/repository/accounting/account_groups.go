package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AccountGroupsRepository interface {
	ListAccountGroups(ctx context.Context) ([]db.ListAccountGroupsRow, error)
	CreateAccountGroup(ctx context.Context, params db.CreateAccountGroupParams) (db.AccountGroup, error)
	DeleteAccountGroup(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
}

type AccountGroupTxRepository interface {
	WithTx(tx pgx.Tx) AccountGroupTxRepository
	LockAccountGroupTree(ctx context.Context) error
	IsAccountGroupInSubtree(ctx context.Context, params db.IsAccountGroupInSubtreeParams) (bool, error)
	UpdateAccountGroup(ctx context.Context, params db.UpdateAccountGroupParams) (db.AccountGroup, error)
}

type accountGroupTxRepository struct {
	queries *db.Queries
}

func NewAccountGroupTxRepository(queries *db.Queries) AccountGroupTxRepository {
	return &accountGroupTxRepository{queries: queries}
}

func (r *accountGroupTxRepository) WithTx(tx pgx.Tx) AccountGroupTxRepository {
	return &accountGroupTxRepository{queries: r.queries.WithTx(tx)}
}

func (r *accountGroupTxRepository) LockAccountGroupTree(ctx context.Context) error {
	return r.queries.LockAccountGroupTree(ctx)
}

func (r *accountGroupTxRepository) IsAccountGroupInSubtree(ctx context.Context, params db.IsAccountGroupInSubtreeParams) (bool, error) {
	return r.queries.IsAccountGroupInSubtree(ctx, params)
}

func (r *accountGroupTxRepository) UpdateAccountGroup(ctx context.Context, params db.UpdateAccountGroupParams) (db.AccountGroup, error) {
	return r.queries.UpdateAccountGroup(ctx, params)
}
