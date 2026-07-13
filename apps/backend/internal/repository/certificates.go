package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type CertificatesRepository interface {
	IssueCertificate(ctx context.Context, certificate db.IssueCertificateParams) (db.Certificate, error)
	GetStudentStatus(ctx context.Context, id pgtype.UUID) (string, error)
	GetStudentEnrolledCourseName(ctx context.Context, params db.GetStudentEnrolledCourseNameParams) (string, error)
	ListStudentCertificates(ctx context.Context, studentID pgtype.UUID) ([]db.ListStudentCertificatesRow, error)
	GetCertificateDetails(ctx context.Context, id string) (db.GetCertificateDetailsRow, error)
}
