package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AdminRepository interface {
	GetStudentByID(ctx context.Context, id pgtype.UUID) (db.GetStudentByIDRow, error)
	ListStudents(ctx context.Context, params db.ListStudentsParams) ([]db.ListStudentsRow, error)
	GetStudentsCount(ctx context.Context, params db.GetStudentsCountParams) (int64, error)
	GetCoursesByStudentID(ctx context.Context, studentID pgtype.UUID) ([]db.GetCoursesByStudentIDRow, error)

	GetPaymentsByStudent(ctx context.Context, studentID pgtype.UUID) ([]db.GetPaymentsByStudentRow, error)

	UpdateStudentStatus(ctx context.Context, params db.UpdateStudentStatusParams) (db.Student, error)
	CreateCourse(ctx context.Context, params db.CreateCourseParams) (db.Course, error)
	UpdateCourse(ctx context.Context, params db.UpdateCourseParams) (db.Course, error)
	ToggleCourseActive(ctx context.Context, params db.ToggleCourseActiveParams) (db.Course, error)
	DeleteCourse(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	UpdateSetting(ctx context.Context, params db.UpdateSettingParams) (db.Setting, error)
	GetAdmissionSettings(ctx context.Context) ([]db.Setting, error)
	ListInquiries(ctx context.Context, params db.ListInquiriesParams) ([]db.Inquiry, error)
	GetInquiriesCount(ctx context.Context, params db.GetInquiriesCountParams) (int32, error)
	ListInquirySources(ctx context.Context) ([]string, error)
	MarkInquiryRead(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	DeleteInquiry(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	CountUnreadInquiries(ctx context.Context) (int32, error)
	CountReadInquiries(ctx context.Context) (int32, error)

	// admin/students/outstanding
	GetOutstandingFeesCount(ctx context.Context, params db.GetOutstandingFeesCountParams) (int64, error)
	GetOutstandingFeesTotal(ctx context.Context, params db.GetOutstandingFeesTotalParams) (int64, error)
	GetStudentsWithOutstandingFees(ctx context.Context, params db.GetStudentsWithOutstandingFeesParams) ([]db.GetStudentsWithOutstandingFeesRow, error)

	// admin/students/sales
	GetSalesRevenue(ctx context.Context, params db.GetSalesRevenueParams) ([]db.GetSalesRevenueRow, error)
	GetSalesRevenueTotal(ctx context.Context, params db.GetSalesRevenueTotalParams) (int64, error)
	GetSalesRevenueCount(ctx context.Context, params db.GetSalesRevenueCountParams) (int64, error)

	// admin/students/:id
	UpdateStudentPersonalInfo(ctx context.Context, params db.UpdateStudentPersonalInfoParams) (pgconn.CommandTag, error)
	UpdateStudentGuardianInfo(ctx context.Context, params db.UpdateStudentGuardianInfoParams) (pgconn.CommandTag, error)

	GetDistinctBatches(ctx context.Context) ([]pgtype.Text, error)
}

type AdminPaymentTxRepository interface {
	WithTx(tx pgx.Tx) AdminPaymentTxRepository
	GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error)
	AddPayment(ctx context.Context, params db.AddPaymentParams) (db.Payment, error)
	GetStudentByID(ctx context.Context, id pgtype.UUID) (db.GetStudentByIDRow, error)
	CreateBankLedgerEntry(ctx context.Context, params db.CreateBankLedgerEntryParams) (db.BankLedger, error)
	CreateCashLedgerEntry(ctx context.Context, params db.CreateCashLedgerEntryParams) (db.CashLedger, error)
	GetDefaultBankAccount(ctx context.Context) (db.GetDefaultBankAccountRow, error)
}

type adminPaymentTxRepository struct {
	queries *db.Queries
	pool    *pgxpool.Pool
}

func NewAdminPaymentTxRepository(queries *db.Queries, pool *pgxpool.Pool) AdminPaymentTxRepository {
	return &adminPaymentTxRepository{queries: queries, pool: pool}
}

func (r *adminPaymentTxRepository) WithTx(tx pgx.Tx) AdminPaymentTxRepository {
	return &adminPaymentTxRepository{queries: r.queries.WithTx(tx), pool: r.pool}
}

func (r *adminPaymentTxRepository) GetStudentFeeSummary(ctx context.Context, id pgtype.UUID) (db.GetStudentFeeSummaryRow, error) {
	return r.queries.GetStudentFeeSummary(ctx, id)
}

func (r *adminPaymentTxRepository) AddPayment(ctx context.Context, params db.AddPaymentParams) (db.Payment, error) {
	return r.queries.AddPayment(ctx, params)
}

func (r *adminPaymentTxRepository) GetStudentByID(ctx context.Context, id pgtype.UUID) (db.GetStudentByIDRow, error) {
	return r.queries.GetStudentByID(ctx, id)
}

func (r *adminPaymentTxRepository) CreateBankLedgerEntry(ctx context.Context, params db.CreateBankLedgerEntryParams) (db.BankLedger, error) {
	return r.queries.CreateBankLedgerEntry(ctx, params)
}

func (r *adminPaymentTxRepository) CreateCashLedgerEntry(ctx context.Context, params db.CreateCashLedgerEntryParams) (db.CashLedger, error) {
	return r.queries.CreateCashLedgerEntry(ctx, params)
}

func (r *adminPaymentTxRepository) GetDefaultBankAccount(ctx context.Context) (db.GetDefaultBankAccountRow, error) {
	return r.queries.GetDefaultBankAccount(ctx)
}
