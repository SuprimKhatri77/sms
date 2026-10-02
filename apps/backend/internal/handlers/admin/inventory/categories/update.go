package categories

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerUpdateProductCategory = "UpdateProductCategory"

func UpdateProductCategory(queries repository.ProductCategoryTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		categoryID, err := utils.ConvertToUUID(c.Param("categoryID"))
		if err != nil {
			applog.Warn(c, handlerUpdateProductCategory, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		req, ok := bindProductCategoryRequest(c, handlerUpdateProductCategory)
		if !ok {
			return
		}
		parentID := utils.ToNullableUUID(req.ParentID)

		tx, err := pool.Begin(ctx)
		if err != nil {
			respondProductCategoryWriteError(c, handlerUpdateProductCategory, err)
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		// Held until commit, so the cycle check below and the update happen
		// as one step relative to any other move.
		if err := qtx.LockProductCategoryTree(ctx); err != nil {
			respondProductCategoryWriteError(c, handlerUpdateProductCategory, err)
			return
		}

		if parentID.Valid {
			// Also true when the parent is the category itself.
			circular, err := qtx.IsProductCategoryInSubtree(ctx, db.IsProductCategoryInSubtreeParams{
				ParentID:   parentID,
				CategoryID: categoryID,
			})
			if err != nil {
				respondProductCategoryWriteError(c, handlerUpdateProductCategory, err)
				return
			}
			if circular {
				applog.Warn(c, handlerUpdateProductCategory, "circular parent")
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "A category can't be moved under itself or one of its sub-categories",
					Code:    constants.ProductCategoryCircular,
					Errors: []types.AppError{{
						Code:    constants.ProductCategoryCircular,
						Field:   "parentId",
						Message: "A category can't be moved under itself or one of its sub-categories",
					}},
				})
				return
			}
		}

		if _, err := qtx.UpdateProductCategory(ctx, db.UpdateProductCategoryParams{
			ID:          categoryID,
			ParentID:    parentID,
			Name:        req.Name,
			Description: utils.ToNullableText(req.Description),
		}); err != nil {
			respondProductCategoryWriteError(c, handlerUpdateProductCategory, err)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			respondProductCategoryWriteError(c, handlerUpdateProductCategory, err)
			return
		}

		applog.Info(c, handlerUpdateProductCategory, "product category updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Category updated",
		})
	}
}
