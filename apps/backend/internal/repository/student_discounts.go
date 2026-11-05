package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type StudentDiscounts interface {
	CreateDiscount(ctx context.Context, params db.CreateDiscountParams) (db.StudentDiscount, error)
	UpdateDiscount(ctx context.Context, params db.UpdateDiscountParams) (db.StudentDiscount, error)
	DeleteDiscount(ctx context.Context, id pgtype.UUID) error

	GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error)
	GetDiscountByID(ctx context.Context, id pgtype.UUID) (db.StudentDiscount, error)

	ListDiscountsByStudent(ctx context.Context, id pgtype.UUID) ([]db.ListDiscountsByStudentRow, error)
}

type StudentDiscountCreateTxRepository interface {
	WithTx(tx pgx.Tx) StudentDiscountCreateTxRepository
	LockStudentForShare(ctx context.Context, id pgtype.UUID) (pgtype.UUID, error)
	GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error)
	CreateDiscount(ctx context.Context, params db.CreateDiscountParams) (db.StudentDiscount, error)
}

type studentDiscountCreateTxRepository struct {
	queries *db.Queries
}

func NewStudentDiscountCreateTxRepository(queries *db.Queries) StudentDiscountCreateTxRepository {
	return &studentDiscountCreateTxRepository{queries: queries}
}

func (r *studentDiscountCreateTxRepository) WithTx(tx pgx.Tx) StudentDiscountCreateTxRepository {
	return &studentDiscountCreateTxRepository{queries: r.queries.WithTx(tx)}
}

func (r *studentDiscountCreateTxRepository) LockStudentForShare(ctx context.Context, id pgtype.UUID) (pgtype.UUID, error) {
	return r.queries.LockStudentForShare(ctx, id)
}

func (r *studentDiscountCreateTxRepository) GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error) {
	return r.queries.GetStudentFeeSummary(ctx, id)
}

func (r *studentDiscountCreateTxRepository) CreateDiscount(ctx context.Context, params db.CreateDiscountParams) (db.StudentDiscount, error) {
	return r.queries.CreateDiscount(ctx, params)
}
