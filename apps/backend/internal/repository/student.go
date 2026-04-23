package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type StudentRepository interface {
	WithTx(tx pgx.Tx) StudentRepository
	CreateStudent(ctx context.Context, params db.CreateStudentParams) (db.Student, error)
	EnrollStudentInCourse(ctx context.Context, params db.EnrollStudentInCourseParams) error
	GetAdmissionSettings(ctx context.Context) ([]db.Setting, error)
	GetNextSerialNo(ctx context.Context, fiscalYear string) (int32, error)
	CreateInquiry(ctx context.Context, params db.CreateInquiryParams) (db.Inquiry, error)
}

type studentRepository struct {
	queries *db.Queries
	pool    *pgxpool.Pool
}

func NewAdmissionRepository(queries *db.Queries) StudentRepository {
	return &studentRepository{
		queries: queries,
	}
}

func (s *studentRepository) WithTx(tx pgx.Tx) StudentRepository {
	return &studentRepository{queries: s.queries.WithTx(tx), pool: s.pool}
}

func (s *studentRepository) CreateStudent(ctx context.Context, params db.CreateStudentParams) (db.Student, error) {
	return s.queries.CreateStudent(ctx, params)
}

func (s *studentRepository) EnrollStudentInCourse(ctx context.Context, params db.EnrollStudentInCourseParams) error {
	return s.queries.EnrollStudentInCourse(ctx, params)
}

func (s *studentRepository) GetAdmissionSettings(ctx context.Context) ([]db.Setting, error) {
	return s.queries.GetAdmissionSettings(ctx)
}

func (s *studentRepository) GetNextSerialNo(ctx context.Context, fiscalYear string) (int32, error) {
	return s.queries.GetNextSerialNo(ctx, fiscalYear)
}

func (s *studentRepository) CreateInquiry(ctx context.Context, params db.CreateInquiryParams) (db.Inquiry, error) {
	return s.queries.CreateInquiry(ctx, params)
}
