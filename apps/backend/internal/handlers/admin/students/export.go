package students

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/export"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

type exportStudentsParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	Status string `form:"status"`
	Shift  string `form:"shift"`
	Batch  string `form:"batch"`
	Course string `form:"course"`
	Search string `form:"q"`
}

const handlerExportStudents = "ExportStudents"

// ExportStudents downloads every student matching the listing's filters
// (not just one page) as CSV, XLSX or PDF.
func ExportStudents(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params exportStudentsParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportStudents, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetStudentsCount(ctx, db.GetStudentsCountParams{
			Status: params.Status,
			Shift:  params.Shift,
			Batch:  params.Batch,
			Course: params.Course,
			Search: params.Search,
		})
		if err != nil {
			applog.Error(c, handlerExportStudents, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		if total > export.MaxRows {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Too many rows to export, narrow the filters",
				Code:    constants.ExportTooLarge,
			})
			return
		}

		students, err := queries.ListStudents(ctx, db.ListStudentsParams{
			Limit:  pgtype.Int4{},
			Offset: 0,
			Status: params.Status,
			Shift:  params.Shift,
			Batch:  params.Batch,
			Course: params.Course,
			Search: params.Search,
		})
		if err != nil {
			applog.Error(c, handlerExportStudents, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		rows := make([][]any, 0, len(students))
		for _, s := range students {
			courses, _ := s.Courses.(string)
			rows = append(rows, []any{
				s.ReferenceNo,
				s.FullName,
				s.Phone,
				strings.ReplaceAll(courses, ",", ", "),
				s.Batch.String,
				s.Shift,
				s.Status,
				export.DateAD(s.CreatedAt.Time),
				export.DateBS(s.CreatedAt.Time),
			})
		}

		table := export.Table{
			Title: "Students",
			Meta: export.Filters(
				export.Labelled("Status", params.Status),
				export.Labelled("Shift", params.Shift),
				export.Labelled("Batch", params.Batch),
				export.Labelled("Course", params.Course),
				export.Labelled("Search", params.Search),
			),
			Columns: []export.Column{
				{Header: "Ref No", Width: 14},
				{Header: "Name", Width: 24},
				{Header: "Phone", Width: 14},
				{Header: "Courses", Width: 22},
				{Header: "Batch", Width: 10},
				{Header: "Shift", Width: 10},
				{Header: "Status", Width: 11},
				{Header: "Admitted (AD)", Width: 13},
				{Header: "Admitted (BS)", Width: 13},
			},
			Rows:   rows,
			Totals: []any{"Total", fmt.Sprintf("%d students", len(rows)), "", "", "", "", "", "", ""},
		}

		if err := export.Write(c, export.Format(params.Format), "students", table); err != nil {
			applog.Error(c, handlerExportStudents, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}

type exportFinanceParams struct {
	Format string `form:"format" binding:"required,oneof=csv xlsx pdf"`
	From   string `form:"from" binding:"omitempty,date_format"`
	To     string `form:"to" binding:"omitempty,date_format"`
	Search string `form:"search" binding:"omitempty,max=100"`
}

const handlerExportSalesRevenue = "ExportSalesRevenue"

// ExportSalesRevenue downloads the sales revenue list for the given date
// range and search, with a totals row across the money columns.
func ExportSalesRevenue(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params exportFinanceParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportSalesRevenue, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetSalesRevenueCount(ctx, db.GetSalesRevenueCountParams{
			FromDate: utils.ToNullableText(params.From),
			ToDate:   utils.ToNullableText(params.To),
			Search:   utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportSalesRevenue, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		if total > export.MaxRows {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Too many rows to export, narrow the filters",
				Code:    constants.ExportTooLarge,
			})
			return
		}

		students, err := queries.GetSalesRevenue(ctx, db.GetSalesRevenueParams{
			Limit:    pgtype.Int4{},
			Offset:   0,
			FromDate: utils.ToNullableText(params.From),
			ToDate:   utils.ToNullableText(params.To),
			Search:   utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportSalesRevenue, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		fees := make([]studentFees, 0, len(students))
		for _, s := range students {
			fees = append(fees, studentFees{s.Name, s.Email, s.TotalCourseFee, s.TotalPaid, s.TotalDiscount, s.TotalScholarship, s.Outstanding})
		}

		table := studentFeesTable("Sales Revenue", params, fees)
		if err := export.Write(c, export.Format(params.Format), "sales-revenue", table); err != nil {
			applog.Error(c, handlerExportSalesRevenue, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}

const handlerExportOutstanding = "ExportOutstanding"

// ExportOutstanding downloads the students with outstanding fees for the
// given date range and search, with a totals row across the money columns.
func ExportOutstanding(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var params exportFinanceParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerExportOutstanding, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetOutstandingFeesCount(ctx, db.GetOutstandingFeesCountParams{
			FromDate: utils.ToNullableText(params.From),
			ToDate:   utils.ToNullableText(params.To),
			Search:   utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportOutstanding, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		if total > export.MaxRows {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Too many rows to export, narrow the filters",
				Code:    constants.ExportTooLarge,
			})
			return
		}

		students, err := queries.GetStudentsWithOutstandingFees(ctx, db.GetStudentsWithOutstandingFeesParams{
			Limit:    pgtype.Int4{},
			Offset:   0,
			FromDate: utils.ToNullableText(params.From),
			ToDate:   utils.ToNullableText(params.To),
			Search:   utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerExportOutstanding, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		fees := make([]studentFees, 0, len(students))
		for _, s := range students {
			fees = append(fees, studentFees{s.Name, s.Email, s.TotalCourseFee, s.TotalPaid, s.TotalDiscount, s.TotalScholarship, s.Outstanding})
		}

		table := studentFeesTable("Outstanding Fees", params, fees)
		if err := export.Write(c, export.Format(params.Format), "outstanding-fees", table); err != nil {
			applog.Error(c, handlerExportOutstanding, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
		}
	}
}

// studentFees is one row of the sales and outstanding lists, which share
// the same columns (their sqlc row types are identical but distinct).
type studentFees struct {
	Name, Email                                         string
	CourseFee, Paid, Discount, Scholarship, Outstanding int64
}

func studentFeesTable(title string, params exportFinanceParams, fees []studentFees) export.Table {
	rows := make([][]any, 0, len(fees))
	var sum studentFees
	for _, f := range fees {
		rows = append(rows, []any{
			f.Name,
			f.Email,
			export.Money(f.CourseFee),
			export.Money(f.Paid),
			export.Money(f.Discount),
			export.Money(f.Scholarship),
			export.Money(f.Outstanding),
		})
		sum.CourseFee += f.CourseFee
		sum.Paid += f.Paid
		sum.Discount += f.Discount
		sum.Scholarship += f.Scholarship
		sum.Outstanding += f.Outstanding
	}

	return export.Table{
		Title: title,
		Meta: export.Filters(
			export.DateRange(params.From, params.To),
			export.Labelled("Search", params.Search),
		),
		Columns: []export.Column{
			{Header: "Name", Width: 24},
			{Header: "Email", Width: 28},
			{Header: "Course Fee", Money: true, Width: 14},
			{Header: "Collected", Money: true, Width: 14},
			{Header: "Discounts", Money: true, Width: 14},
			{Header: "Scholarship", Money: true, Width: 14},
			{Header: "Remaining", Money: true, Width: 14},
		},
		Rows: rows,
		Totals: []any{
			fmt.Sprintf("Total (%d students)", len(rows)),
			"",
			export.Money(sum.CourseFee),
			export.Money(sum.Paid),
			export.Money(sum.Discount),
			export.Money(sum.Scholarship),
			export.Money(sum.Outstanding),
		},
	}
}
