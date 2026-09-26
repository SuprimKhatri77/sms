package students

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"golang.org/x/sync/errgroup"
)

type salesQueryParams struct {
	Page   int    `form:"page"`
	From   string `form:"from"`
	To     string `form:"to"`
	Search string `form:"search"`
}

type SalesResponse struct {
	Students              []db.GetSalesRevenueRow `json:"students"`
	TotalSalesRevenueFees int                     `json:"totalSalesFees"`
}

func ListSalesRevenueForStudents(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const LIMIT = 20

		var params salesQueryParams
		if err := c.ShouldBindQuery(&params); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		slog.Debug("sales query params", slog.Any("params", params))

		if params.Page < 1 {
			params.Page = 1

		}

		total, err := queries.GetSalesRevenueCount(ctx, db.GetSalesRevenueCountParams{
			FromDate: utils.ToNullableText(params.From),
			ToDate:   utils.ToNullableText(params.To),
			Search:   utils.ToNullableText(params.Search),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if total == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data: SalesResponse{
					Students:              []db.GetSalesRevenueRow{},
					TotalSalesRevenueFees: 0,
				},
				Meta: &types.PaginationMeta{
					Total:      0,
					Limit:      LIMIT,
					Page:       params.Page,
					TotalPages: 0,
				},
			})
			return
		}

		totalPages := (total + LIMIT - 1) / LIMIT

		if params.Page > int(totalPages) {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		offset := LIMIT * (params.Page - 1)

		g, gCtx := errgroup.WithContext(ctx)

		var students []db.GetSalesRevenueRow
		var grandTotal int64

		g.Go(func() error {
			var err error

			students, err = queries.GetSalesRevenue(gCtx, db.GetSalesRevenueParams{
				Limit:    pgtype.Int4{Int32: LIMIT, Valid: true},
				Offset:   int32(offset),
				Search:   utils.ToNullableText(params.Search),
				FromDate: utils.ToNullableText(params.From),
				ToDate:   utils.ToNullableText(params.To),
			})

			return err
		})

		g.Go(func() error {
			var err error

			grandTotal, err = queries.GetSalesRevenueTotal(gCtx, db.GetSalesRevenueTotalParams{
				Search:   utils.ToNullableText(params.Search),
				FromDate: utils.ToNullableText(params.From),
				ToDate:   utils.ToNullableText(params.To),
			})

			return err
		})

		if err := g.Wait(); err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Meta: &types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       params.Page,
				Limit:      LIMIT,
			},
			Data: SalesResponse{
				Students:              students,
				TotalSalesRevenueFees: int(grandTotal),
			},
		})

	}
}
