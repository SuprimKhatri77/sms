package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AdminRepository interface {
	GetStudentByID(ctx context.Context, id pgtype.UUID) (db.Student, error)
	ListStudents(ctx context.Context, params db.ListStudentsParams) ([]db.ListStudentsRow, error)
	GetStudentsCount(ctx context.Context) (int64, error)
	GetCoursesByStudentID(ctx context.Context, studentID pgtype.UUID) ([]db.Course, error)
	GetPaymentsByStudent(ctx context.Context, studentID pgtype.UUID) ([]db.GetPaymentsByStudentRow, error)
	AddPayment(ctx context.Context, params db.AddPaymentParams) (db.Payment, error)
}
