package admin

import (
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerGetAnalytics = "GetAnalytics"

type GetAnalyticsParams struct {
	From string `form:"from" binding:"omitempty,date_format"`
	To   string `form:"to" binding:"omitempty,date_format"`
}

type result[T any] struct {
	data T
	err  error
}

func GetAnalytics(queries repository.AnalyticsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params GetAnalyticsParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerGetAnalytics, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		if params.From != "" && params.To != "" && params.From > params.To {
			applog.Warn(c, handlerGetAnalytics, "invalid request",
				slog.String("from", params.From),
				slog.String("to", params.To))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		from := utils.ToNullableText(params.From)
		to := utils.ToNullableText(params.To)

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
			data, err := queries.GetAnalyticsOverview(ctx, db.GetAnalyticsOverviewParams{
				From: from,
				To:   to,
			})
			overviewCh <- result[db.GetAnalyticsOverviewRow]{data, err}
		}()

		go func() {
			data, err := queries.GetMonthlyRevenue(ctx, db.GetMonthlyRevenueParams{
				From: from,
				To:   to,
			})
			monthlyRevenueCh <- result[[]db.GetMonthlyRevenueRow]{data, err}
		}()

		go func() {
			data, err := queries.GetMonthlyAdmissions(ctx, db.GetMonthlyAdmissionsParams{
				From: from,
				To:   to,
			})
			monthlyAdmissionsCh <- result[[]db.GetMonthlyAdmissionsRow]{data, err}
		}()

		go func() {
			data, err := queries.GetSourceBreakdown(ctx, db.GetSourceBreakdownParams{
				From: from,
				To:   to,
			})
			sourceBreakdownCh <- result[[]db.GetSourceBreakdownRow]{data, err}
		}()

		go func() {
			data, err := queries.GetStatusBreakdown(ctx, db.GetStatusBreakdownParams{
				From: from,
				To:   to,
			})
			statusBreakdownCh <- result[db.GetStatusBreakdownRow]{data, err}
		}()

		go func() {
			data, err := queries.GetCoursePopularity(ctx, db.GetCoursePopularityParams{
				From: from,
				To:   to,
			})
			coursePopularityCh <- result[[]db.GetCoursePopularityRow]{data, err}
		}()

		go func() {
			data, err := queries.GetInquiryStats(ctx, db.GetInquiryStatsParams{
				From: from,
				To:   to,
			})
			inquiryStatsCh <- result[db.GetInquiryStatsRow]{data, err}
		}()

		go func() {
			data, err := queries.GetMonthlyInquiries(ctx, db.GetMonthlyInquiriesParams{
				From: from,
				To:   to,
			})
			monthlyInquiriesCh <- result[[]db.GetMonthlyInquiriesRow]{data, err}
		}()

		go func() {
			data, err := queries.GetRevenueStats(ctx, db.GetRevenueStatsParams{
				From: from,
				To:   to,
			})
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
				applog.Error(c, handlerGetAnalytics, "failed to process request",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
		}

		monthlyRevenueRes.data = utils.EnsureSlice(monthlyRevenueRes.data)
		monthlyAdmissionsRes.data = utils.EnsureSlice(monthlyAdmissionsRes.data)
		sourceBreakdownRes.data = utils.EnsureSlice(sourceBreakdownRes.data)
		monthlyInquiriesRes.data = utils.EnsureSlice(monthlyInquiriesRes.data)
		coursePopularityRes.data = utils.EnsureSlice(coursePopularityRes.data)

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
