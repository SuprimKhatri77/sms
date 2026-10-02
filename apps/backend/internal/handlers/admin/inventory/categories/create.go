package categories

import (
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerCreateProductCategory = "CreateProductCategory"

// A brand-new category can't be anyone's ancestor, so creating one can't form a
// cycle and doesn't need the tree lock that updates take.
func CreateProductCategory(queries repository.ProductCategoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		req, ok := bindProductCategoryRequest(c, handlerCreateProductCategory)
		if !ok {
			return
		}

		category, err := queries.CreateProductCategory(ctx, db.CreateProductCategoryParams{
			ParentID:    utils.ToNullableUUID(req.ParentID),
			Name:        req.Name,
			Description: utils.ToNullableText(req.Description),
		})
		if err != nil {
			respondProductCategoryWriteError(c, handlerCreateProductCategory, err)
			return
		}

		applog.Info(c, handlerCreateProductCategory, "product category created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Category created",
			Data:    category,
		})
	}
}
