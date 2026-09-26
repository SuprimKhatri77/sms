package payments

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

type ListPaymentsParams struct {
	Page   int    `form:"page,default=1" binding:"required,min=1"`
	From   string `form:"from" binding:"omitempty,date_format"`
	To     string `form:"to" binding:"omitempty,date_format"`
	Search string `form:"search" binding:"omitempty,min=1,max=100"`
}

const handlerListPayments = "ListPayments"

type ListPaymentsResponse struct {
	Payments      []db.GetAllPaymentsRow `json:"payments"`
	TotalPayments int64                  `json:"totalPayments"`
}

func ListPayments(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		pageLimit := 50

		var params ListPaymentsParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerListPayments, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetAllPaymentsCount(ctx, db.GetAllPaymentsCountParams{
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerListPayments, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if total == 0 {
			if params.Page > 1 {
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Page not found",
					Code:    constants.InvalidQueryParam,
				})
				return
			}

			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data: ListPaymentsResponse{
					Payments:      []db.GetAllPaymentsRow{},
					TotalPayments: 0,
				},
				Meta: &types.PaginationMeta{
					Total:      int(total),
					TotalPages: 0,
					Limit:      pageLimit,
					Page:       params.Page,
				},
			})
			return
		}

		totalPages := (int(total) + pageLimit - 1) / pageLimit
		if params.Page > int(totalPages) {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Page not found",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		offset := pageLimit * (params.Page - 1)

		payments, err := queries.GetAllPayments(ctx, db.GetAllPaymentsParams{
			Limit:  pgtype.Int4{Int32: int32(pageLimit), Valid: true},
			Offset: int32(offset),
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerListPayments, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		totalPayments, err := queries.GetAllPaymentsTotal(ctx, db.GetAllPaymentsTotalParams{
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerListPayments, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data: ListPaymentsResponse{
				Payments:      payments,
				TotalPayments: totalPayments,
			},
			Meta: &types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       params.Page,
				Limit:      pageLimit,
			},
		})
	}
}
