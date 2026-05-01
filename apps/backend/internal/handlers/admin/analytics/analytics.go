package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

type result[T any] struct {
	data T
	err  error
}

func GetAnalytics(queries repository.AnalyticsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {

		ctx := c.Request.Context()

		overviewCh := make(chan result[db.GetAnalyticsOverviewRow], 1)
		monthlyRevenueCh := make(chan result[[]db.GetMonthlyRevenueRow], 1)
		monthlyAdmissionsCh := make(chan result[[]db.GetMonthlyAdmissionsRow], 1)
		sourceBreakdownCh := make(chan result[[]db.GetSourceBreakdownRow], 1)
		statusBreakdownCh := make(chan result[db.GetStatusBreakdownRow], 1)
		coursePopularityCh := make(chan result[[]db.GetCoursePopularityRow], 1)
		inquiryStatsCh := make(chan result[db.GetInquiryStatsRow], 1)
		monthlyInquiriesCh := make(chan result[[]db.GetMonthlyInquiriesRow], 1)
		revenueStatsCh := make(chan result[db.GetRevenueStatsRow], 1)

		go func() {
			data, err := queries.GetAnalyticsOverview(ctx)
			overviewCh <- result[db.GetAnalyticsOverviewRow]{data, err}
		}()

		go func() {
			data, err := queries.GetMonthlyRevenue(ctx)
			monthlyRevenueCh <- result[[]db.GetMonthlyRevenueRow]{data, err}
		}()

		go func() {
			data, err := queries.GetMonthlyAdmissions(ctx)
			monthlyAdmissionsCh <- result[[]db.GetMonthlyAdmissionsRow]{data, err}
		}()

		go func() {
			data, err := queries.GetSourceBreakdown(ctx)
			sourceBreakdownCh <- result[[]db.GetSourceBreakdownRow]{data, err}
		}()

		go func() {
			data, err := queries.GetStatusBreakdown(ctx)
			statusBreakdownCh <- result[db.GetStatusBreakdownRow]{data, err}
		}()

		go func() {
			data, err := queries.GetCoursePopularity(ctx)
			coursePopularityCh <- result[[]db.GetCoursePopularityRow]{data, err}
		}()

		go func() {
			data, err := queries.GetInquiryStats(ctx)
			inquiryStatsCh <- result[db.GetInquiryStatsRow]{data, err}
		}()

		go func() {
			data, err := queries.GetMonthlyInquiries(ctx)
			monthlyInquiriesCh <- result[[]db.GetMonthlyInquiriesRow]{data, err}
		}()

		go func() {
			data, err := queries.GetRevenueStats(ctx)
			revenueStatsCh <- result[db.GetRevenueStatsRow]{data, err}
		}()

		overviewRes := <-overviewCh
		monthlyRevenueRes := <-monthlyRevenueCh
		monthlyAdmissionsRes := <-monthlyAdmissionsCh
		sourceBreakdownRes := <-sourceBreakdownCh
		statusBreakdownRes := <-statusBreakdownCh
		coursePopularityRes := <-coursePopularityCh
		inquiryStatsRes := <-inquiryStatsCh
		monthlyInquiriesRes := <-monthlyInquiriesCh
		revenueStatsRes := <-revenueStatsCh

		for _, err := range []error{
			overviewRes.err,
			monthlyRevenueRes.err,
			monthlyAdmissionsRes.err,
			sourceBreakdownRes.err,
			statusBreakdownRes.err,
			coursePopularityRes.err,
			inquiryStatsRes.err,
			monthlyInquiriesRes.err,
			revenueStatsRes.err,
		} {
			if err != nil {
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data: types.AnalyticsResponse{
				Overview:          overviewRes.data,
				MonthlyRevenue:    monthlyRevenueRes.data,
				MonthlyAdmissions: monthlyAdmissionsRes.data,
				SourceBreakdown:   sourceBreakdownRes.data,
				StatusBreakdown:   statusBreakdownRes.data,
				CoursePopularity:  coursePopularityRes.data,
				InquiryStats:      inquiryStatsRes.data,
				MonthlyInquiries:  monthlyInquiriesRes.data,
				RevenueStats:      revenueStatsRes.data,
			},
		})

	}
}
