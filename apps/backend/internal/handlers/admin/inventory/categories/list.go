package categories

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListProductCategories = "ListProductCategories"

// ListProductCategories returns every category as a flat list with its
// product count; the client builds the tree from parentId. Categories are
// few, so the list isn't paginated.
func ListProductCategories(queries repository.ProductCategoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		categories, err := queries.ListProductCategories(ctx)
		if err != nil {
			applog.Error(c, handlerListProductCategories, "failed to process request",
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
			Data:    utils.EnsureSlice(categories),
		})
	}
}
