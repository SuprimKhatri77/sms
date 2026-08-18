package products

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListProducts = "ListProducts"

type ListProductsParams struct {
	Name string `form:"name"`
	From string `form:"from"`
	To   string `form:"to"`
}

func ListProducts(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		const (
			defaultLimit = 20
			maxLimit     = 40
		)

		var filter ListProductsParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			applog.Warn(c, handlerListProducts, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			applog.Warn(c, handlerListProducts, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		limit, err := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultLimit)))
		if err != nil || limit <= 0 {
			applog.Warn(c, handlerListProducts, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}
		if limit > maxLimit {
			limit = maxLimit
		}

		total, err := queries.GetProductCount(ctx, db.GetProductCountParams{
			Name: utils.ToNullableText(filter.Name),
			From: utils.ToNullableDate(filter.From),
			To:   utils.ToNullableDate(filter.To),
		})
		if err != nil {
			applog.Error(c, handlerListProducts, "failed to process request",
				slog.Any(applog.AttrError, err))
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
				Data:    []db.Product{},
				Meta: &types.PaginationMeta{
					Total:      int(total),
					Limit:      limit,
					TotalPages: 0,
					Page:       page,
				},
			})
			return
		}

		totalPages := (total + int64(limit) - 1) / int64(limit)
		if page > int(totalPages) {
			applog.Warn(c, handlerListProducts, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter value",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		offset := limit * (page - 1)

		products, err := queries.ListProducts(ctx, db.ListProductsParams{
			Limit:  int32(limit),
			Offset: int32(offset),
			Name:   utils.ToNullableText(filter.Name),
			From:   utils.ToNullableDate(filter.From),
			To:     utils.ToNullableDate(filter.To),
		})
		if err != nil {
			applog.Error(c, handlerListProducts, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(products) == 0 {
			products = []db.Product{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    products,
			Meta: &types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       page,
				Limit:      limit,
			},
		})
	}
}
