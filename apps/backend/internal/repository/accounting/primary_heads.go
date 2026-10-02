package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type PrimaryHeadsRepository interface {
	ListPrimaryHeads(ctx context.Context) ([]db.PrimaryHead, error)
	CreatePrimaryHead(ctx context.Context, params db.CreatePrimaryHeadParams) (db.PrimaryHead, error)
	DeletePrimaryHead(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
}

type PrimaryHeadTxRepository interface {
	WithTx(tx pgx.Tx) PrimaryHeadTxRepository
	LockPrimaryHeadTree(ctx context.Context) error
	IsPrimaryHeadInSubtree(ctx context.Context, params db.IsPrimaryHeadInSubtreeParams) (bool, error)
	UpdatePrimaryHead(ctx context.Context, params db.UpdatePrimaryHeadParams) (db.PrimaryHead, error)
}

type primaryHeadTxRepository struct {
	queries *db.Queries
}

func NewPrimaryHeadTxRepository(queries *db.Queries) PrimaryHeadTxRepository {
	return &primaryHeadTxRepository{queries: queries}
}

func (r *primaryHeadTxRepository) WithTx(tx pgx.Tx) PrimaryHeadTxRepository {
	return &primaryHeadTxRepository{queries: r.queries.WithTx(tx)}
}

func (r *primaryHeadTxRepository) LockPrimaryHeadTree(ctx context.Context) error {
	return r.queries.LockPrimaryHeadTree(ctx)
}

func (r *primaryHeadTxRepository) IsPrimaryHeadInSubtree(ctx context.Context, params db.IsPrimaryHeadInSubtreeParams) (bool, error) {
	return r.queries.IsPrimaryHeadInSubtree(ctx, params)
}

func (r *primaryHeadTxRepository) UpdatePrimaryHead(ctx context.Context, params db.UpdatePrimaryHeadParams) (db.PrimaryHead, error) {
	return r.queries.UpdatePrimaryHead(ctx, params)
}
