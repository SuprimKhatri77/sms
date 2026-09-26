package discount

import (
	"log/slog"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListDiscount = "ListDiscount"

func ListDiscount(queries repository.StudentDiscounts) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		studentIDFromParam := c.Param("studentID")
		if studentIDFromParam == "" {
			applog.Warn(c, handlerListDiscount, "invalid request",
				applog.WithStudentID(studentIDFromParam))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing student ID",
				Code:    constants.MissingStudentID,
			})
			return
		}

		studentID, err := utils.ConvertToUUID(studentIDFromParam)
		if err != nil {
			applog.Error(c, handlerListDiscount, "failed to process request",
				applog.WithStudentID(studentIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		discounts, err := queries.ListDiscountsByStudent(ctx, studentID)
		if err != nil {
			applog.Error(c, handlerListDiscount, "failed to process request",
				applog.WithStudentID(studentIDFromParam),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(discounts) == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data:    []db.ListDiscountsByStudentRow{},
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    discounts,
		})
	}

}

type ListAllDiscountsParams struct {
	Page   int    `form:"page,default=1" binding:"required,min=1"`
	From   string `form:"from" binding:"omitempty,date_format"`
	To     string `form:"to" binding:"omitempty,date_format"`
	Search string `form:"search" binding:"omitempty,min=1,max=100"`
}

const handlerListAllDiscounts = "ListAllDiscounts"

type ListAllDiscountsResponse struct {
	Discounts      []db.GetAllStudentDiscountsRow `json:"discounts"`
	TotalDiscounts int64                          `json:"totalDiscounts"`
}

func ListAllStudentDiscounts(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		pageLimit := 50

		var params ListAllDiscountsParams
		if err := c.ShouldBindQuery(&params); err != nil {
			applog.Warn(c, handlerListAllDiscounts, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetAllStudentDiscountsCount(ctx, db.GetAllStudentDiscountsCountParams{
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerListAllDiscounts, "failed to process request",
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
				Data: ListAllDiscountsResponse{
					Discounts:      []db.GetAllStudentDiscountsRow{},
					TotalDiscounts: 0,
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

		discounts, err := queries.GetAllStudentDiscounts(ctx, db.GetAllStudentDiscountsParams{
			Limit:  pgtype.Int4{Int32: int32(pageLimit), Valid: true},
			Offset: int32(offset),
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerListAllDiscounts, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		totalDiscounts, err := queries.GetAllStudentDiscountsTotal(ctx, db.GetAllStudentDiscountsTotalParams{
			From:   utils.ToNullableText(params.From),
			To:     utils.ToNullableText(params.To),
			Search: utils.ToNullableText(params.Search),
		})
		if err != nil {
			applog.Error(c, handlerListAllDiscounts, "failed to process request",
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
			Data: ListAllDiscountsResponse{
				Discounts:      discounts,
				TotalDiscounts: totalDiscounts,
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
