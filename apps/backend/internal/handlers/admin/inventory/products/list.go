package products

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

func ListProducts(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		const LIMIT = 20

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		total, err := queries.GetProductCount(ctx)
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
				Data:    []db.Product{},
				Meta: &types.PaginationMeta{
					Total:      int(total),
					Limit:      LIMIT,
					TotalPages: 0,
					Page:       page,
				},
			})
			return
		}

		totalPages := (total + LIMIT - 1) / LIMIT
		if page > int(totalPages) {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter value",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		offset := LIMIT * (page - 1)

		products, err := queries.ListProducts(ctx, db.ListProductsParams{
			Limit:  LIMIT,
			Offset: int32(offset),
		})
		if err != nil {
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
				Limit:      LIMIT,
			},
		})
	}
}
