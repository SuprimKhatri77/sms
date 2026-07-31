package repository

import (
	"context"

	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AnalyticsRepository interface {
	GetAnalyticsOverview(ctx context.Context, arg db.GetAnalyticsOverviewParams) (db.GetAnalyticsOverviewRow, error)
	GetMonthlyRevenue(ctx context.Context, arg db.GetMonthlyRevenueParams) ([]db.GetMonthlyRevenueRow, error)
	GetMonthlyAdmissions(ctx context.Context, arg db.GetMonthlyAdmissionsParams) ([]db.GetMonthlyAdmissionsRow, error)
	GetSourceBreakdown(ctx context.Context, arg db.GetSourceBreakdownParams) ([]db.GetSourceBreakdownRow, error)
	GetStatusBreakdown(ctx context.Context, arg db.GetStatusBreakdownParams) (db.GetStatusBreakdownRow, error)
	GetCoursePopularity(ctx context.Context, arg db.GetCoursePopularityParams) ([]db.GetCoursePopularityRow, error)
	GetInquiryStats(ctx context.Context, arg db.GetInquiryStatsParams) (db.GetInquiryStatsRow, error)
	GetMonthlyInquiries(ctx context.Context, arg db.GetMonthlyInquiriesParams) ([]db.GetMonthlyInquiriesRow, error)
	GetRevenueStats(ctx context.Context, arg db.GetRevenueStatsParams) (db.GetRevenueStatsRow, error)
}
