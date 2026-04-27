package repository

import (
	"context"

	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AnalyticsRepository interface {
	GetAnalyticsOverview(ctx context.Context) (db.GetAnalyticsOverviewRow, error)
	GetMonthlyRevenue(ctx context.Context) ([]db.GetMonthlyRevenueRow, error)
	GetMonthlyAdmissions(ctx context.Context) ([]db.GetMonthlyAdmissionsRow, error)
	GetSourceBreakdown(ctx context.Context) ([]db.GetSourceBreakdownRow, error)
	GetStatusBreakdown(ctx context.Context) (db.GetStatusBreakdownRow, error)
	GetCoursePopularity(ctx context.Context) ([]db.GetCoursePopularityRow, error)
	GetInquiryStats(ctx context.Context) (db.GetInquiryStatsRow, error)
	GetMonthlyInquiries(ctx context.Context) ([]db.GetMonthlyInquiriesRow, error)
	GetRevenueStats(ctx context.Context) (db.GetRevenueStatsRow, error)
}
