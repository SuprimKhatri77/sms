package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type StudentsScholarship interface {
	CreateScholarship(ctx context.Context, params db.CreateScholarshipParams) (db.StudentScholarship, error)
	UpdateScholarship(ctx context.Context, params db.UpdateScholarshipParams) (db.StudentScholarship, error)
	DeleteScholarship(ctx context.Context, id pgtype.UUID) error
	GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error)

	GetScholarshipByID(ctx context.Context, id pgtype.UUID) (db.StudentScholarship, error)
	GetScholarshipByStudent(ctx context.Context, id pgtype.UUID) (db.GetScholarshipByStudentRow, error)
}

type StudentScholarshipCreateTxRepository interface {
	WithTx(tx pgx.Tx) StudentScholarshipCreateTxRepository
	LockStudentForShare(ctx context.Context, id pgtype.UUID) (pgtype.UUID, error)
	GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error)
	CreateScholarship(ctx context.Context, params db.CreateScholarshipParams) (db.StudentScholarship, error)
}

type studentScholarshipCreateTxRepository struct {
	queries *db.Queries
}

func NewStudentScholarshipCreateTxRepository(queries *db.Queries) StudentScholarshipCreateTxRepository {
	return &studentScholarshipCreateTxRepository{queries: queries}
}

func (r *studentScholarshipCreateTxRepository) WithTx(tx pgx.Tx) StudentScholarshipCreateTxRepository {
	return &studentScholarshipCreateTxRepository{queries: r.queries.WithTx(tx)}
}

func (r *studentScholarshipCreateTxRepository) LockStudentForShare(ctx context.Context, id pgtype.UUID) (pgtype.UUID, error) {
	return r.queries.LockStudentForShare(ctx, id)
}

func (r *studentScholarshipCreateTxRepository) GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error) {
	return r.queries.GetStudentFeeSummary(ctx, id)
}

func (r *studentScholarshipCreateTxRepository) CreateScholarship(ctx context.Context, params db.CreateScholarshipParams) (db.StudentScholarship, error) {
	return r.queries.CreateScholarship(ctx, params)
}
