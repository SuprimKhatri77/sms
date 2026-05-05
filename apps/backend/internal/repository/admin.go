package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AdminRepository interface {
	GetStudentByID(ctx context.Context, id pgtype.UUID) (db.GetStudentByIDRow, error)
	ListStudents(ctx context.Context, params db.ListStudentsParams) ([]db.ListStudentsRow, error)
	GetStudentsCount(ctx context.Context) (int64, error)
	GetCoursesByStudentID(ctx context.Context, studentID pgtype.UUID) ([]db.Course, error)
	GetPaymentsByStudent(ctx context.Context, studentID pgtype.UUID) ([]db.GetPaymentsByStudentRow, error)
	AddPayment(ctx context.Context, params db.AddPaymentParams) (db.Payment, error)
	UpdateStudentStatus(ctx context.Context, params db.UpdateStudentStatusParams) (db.Student, error)
	CreateCourse(ctx context.Context, params db.CreateCourseParams) (db.Course, error)
	UpdateCourse(ctx context.Context, params db.UpdateCourseParams) (db.Course, error)
	ToggleCourseActive(ctx context.Context, params db.ToggleCourseActiveParams) (db.Course, error)
	DeleteCourse(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	UpdateSetting(ctx context.Context, params db.UpdateSettingParams) (db.Setting, error)
	GetAdmissionSettings(ctx context.Context) ([]db.Setting, error)
	ListInquiries(ctx context.Context, params db.ListInquiriesParams) ([]db.Inquiry, error)
	GetInquiriesCount(ctx context.Context) (int32, error)
	MarkInquiryRead(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	DeleteInquiry(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	CountUnreadInquiries(ctx context.Context) (int32, error)
	CountReadInquiries(ctx context.Context) (int32, error)
}
