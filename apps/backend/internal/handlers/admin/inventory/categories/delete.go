package categories

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerDeleteProductCategory = "DeleteProductCategory"

// The RESTRICT foreign keys are what block deleting a category that is still
// in use, so there's no window between a "has children?" check and the delete.
func DeleteProductCategory(queries repository.ProductCategoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		categoryID, err := utils.ConvertToUUID(c.Param("categoryID"))
		if err != nil {
			applog.Warn(c, handlerDeleteProductCategory, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		result, err := queries.DeleteProductCategory(ctx, categoryID)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				switch pgErr.ConstraintName {
				case "product_categories_parent_id_fkey":
					applog.Warn(c, handlerDeleteProductCategory, "conflict",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Cannot delete a category that has sub-categories. Delete or move them first.",
						Code:    constants.ProductCategoryHasChildren,
					})
					return
				case "products_category_id_fkey":
					applog.Warn(c, handlerDeleteProductCategory, "conflict",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Cannot delete a category that has products. Move them to another category first.",
						Code:    constants.ProductCategoryHasProducts,
					})
					return
				}
			}
			applog.Error(c, handlerDeleteProductCategory, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if result.RowsAffected() == 0 {
			applog.Warn(c, handlerDeleteProductCategory, "resource not found")
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Category not found",
				Code:    constants.ProductCategoryNotFound,
			})
			return
		}

		applog.Info(c, handlerDeleteProductCategory, "product category deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Category deleted",
		})
	}
}
