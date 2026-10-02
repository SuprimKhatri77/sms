package products

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerCreateProduct = "CreateProduct"

func CreateProduct(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req types.CreateProductRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateProduct, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Errors:  validator.Parse(err, req),
				Code:    constants.ValidationFailed,
			})
			return
		}

		utils.TrimStruct(&req)

		product, err := queries.CreateProduct(ctx, db.CreateProductParams{
			Name:       req.Name,
			Unit:       req.Unit,
			CategoryID: utils.ToNullableUUID(req.CategoryID),
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				applog.Warn(c, handlerCreateProduct, "conflict",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "Product already exists",
					Code:    constants.ProductAlreadyExists,
				})
				return
			}
			if errors.As(err, &pgErr) && pgErr.Code == "23503" && pgErr.ConstraintName == "products_category_id_fkey" {
				applog.Warn(c, handlerCreateProduct, "category not found",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Category not found",
					Code:    constants.ProductCategoryNotFound,
					Errors: []types.AppError{{
						Code:    constants.ProductCategoryNotFound,
						Field:   "categoryId",
						Message: "Category not found",
					}},
				})
				return
			}
			applog.Error(c, handlerCreateProduct, "failed to process request",
				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerCreateProduct, "product created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Product created",
			Data:    product,
		})
	}
}
