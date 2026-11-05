package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
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

type CertificateIssueTxRepository interface {
	WithTx(tx pgx.Tx) CertificateIssueTxRepository
	LockStudentForShare(ctx context.Context, id pgtype.UUID) (pgtype.UUID, error)
	GetStudentStatus(ctx context.Context, id pgtype.UUID) (string, error)
	GetStudentEnrolledCourseName(ctx context.Context, params db.GetStudentEnrolledCourseNameParams) (string, error)
	IssueCertificate(ctx context.Context, certificate db.IssueCertificateParams) (db.Certificate, error)
}

type certificateIssueTxRepository struct {
	queries *db.Queries
}

func NewCertificateIssueTxRepository(queries *db.Queries) CertificateIssueTxRepository {
	return &certificateIssueTxRepository{queries: queries}
}

func (r *certificateIssueTxRepository) WithTx(tx pgx.Tx) CertificateIssueTxRepository {
	return &certificateIssueTxRepository{queries: r.queries.WithTx(tx)}
}

func (r *certificateIssueTxRepository) LockStudentForShare(ctx context.Context, id pgtype.UUID) (pgtype.UUID, error) {
	return r.queries.LockStudentForShare(ctx, id)
}

func (r *certificateIssueTxRepository) GetStudentStatus(ctx context.Context, id pgtype.UUID) (string, error) {
	return r.queries.GetStudentStatus(ctx, id)
}

func (r *certificateIssueTxRepository) GetStudentEnrolledCourseName(ctx context.Context, params db.GetStudentEnrolledCourseNameParams) (string, error) {
	return r.queries.GetStudentEnrolledCourseName(ctx, params)
}

func (r *certificateIssueTxRepository) IssueCertificate(ctx context.Context, certificate db.IssueCertificateParams) (db.Certificate, error) {
	return r.queries.IssueCertificate(ctx, certificate)
}
