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

type outstandingQueryParams struct {
	Page   int    `form:"page"`
	From   string `form:"from"`
	To     string `form:"to"`
	Search string `form:"search"`
}

type OutstandingrResponse struct {
	Students             []db.GetStudentsWithOutstandingFeesRow `json:"students"`
	TotalOutstandingFees int                                    `json:"totalOutstandingFees"`
}

func ListOutstandingStudentsDue(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const LIMIT = 20

		var params outstandingQueryParams
		if err := c.ShouldBindQuery(&params); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query params",
				Code:    constants.InvalidQueryParam,
			})
			return
		}
		slog.Debug("outstanding students query params", slog.Any("params", params))

		if params.Page < 1 {
			params.Page = 1
		}
		offset := (params.Page - 1) * LIMIT

		count, err := queries.GetOutstandingFeesCount(ctx, db.GetOutstandingFeesCountParams{
			FromDate: utils.ToNullableText(params.From),
			ToDate:   utils.ToNullableText(params.To),
			Search:   utils.ToNullableText(params.Search),
		})
		if err != nil {
			slog.Error("error getting count", "err", err)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if count == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Meta: &types.PaginationMeta{
					Total:      int(count),
					TotalPages: 0,
					Limit:      LIMIT,
					Page:       params.Page,
				},
			})
			return
		}

		totalPages := (count + LIMIT - 1) / LIMIT
		if params.Page > int(totalPages) {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query param",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		g, gCtx := errgroup.WithContext(ctx)

		var students []db.GetStudentsWithOutstandingFeesRow
		var grandTotal int64

		g.Go(func() error {
			var err error
			students, err = queries.GetStudentsWithOutstandingFees(gCtx, db.GetStudentsWithOutstandingFeesParams{
				Limit:    pgtype.Int4{Int32: LIMIT, Valid: true},
				Offset:   int32(offset),
				FromDate: utils.ToNullableText(params.From),
				ToDate:   utils.ToNullableText(params.To),
				Search:   utils.ToNullableText(params.Search),
			})
			return err
		})

		g.Go(func() error {
			var err error
			grandTotal, err = queries.GetOutstandingFeesTotal(gCtx, db.GetOutstandingFeesTotalParams{
				FromDate: utils.ToNullableText(params.From),
				ToDate:   utils.ToNullableText(params.To),
				Search:   utils.ToNullableText(params.Search),
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
				Total:      int(count),
				TotalPages: int(totalPages),
				Page:       params.Page,
				Limit:      LIMIT,
			},
			Data: OutstandingrResponse{
				Students:             students,
				TotalOutstandingFees: int(grandTotal),
			},
		})
	}
}
