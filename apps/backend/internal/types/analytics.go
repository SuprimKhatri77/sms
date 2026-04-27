package types

import db "github.com/suprimkhatri77/sms/backend/internal/database/generated"

type AnalyticsResponse struct {
	Overview          db.GetAnalyticsOverviewRow   `json:"overview"`
	MonthlyRevenue    []db.GetMonthlyRevenueRow    `json:"monthlyRevenue"`
	MonthlyAdmissions []db.GetMonthlyAdmissionsRow `json:"monthlyAdmissions"`
	SourceBreakdown   []db.GetSourceBreakdownRow   `json:"sourceBreakdown"`
	StatusBreakdown   db.GetStatusBreakdownRow     `json:"statusBreakdown"`
	CoursePopularity  []db.GetCoursePopularityRow  `json:"coursePopularity"`
	InquiryStats      db.GetInquiryStatsRow        `json:"inquiryStats"`
	MonthlyInquiries  []db.GetMonthlyInquiriesRow  `json:"monthlyInquiries"`
	RevenueStats      db.GetRevenueStatsRow        `json:"revenueStats"`
}
