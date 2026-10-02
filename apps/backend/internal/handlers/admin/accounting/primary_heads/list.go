package primaryheads

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListPrimaryHeads = "ListPrimaryHeads"

// ListPrimaryHeads returns every head as a flat list; the client builds the
// tree from parentId. The chart of accounts is small, so it isn't paginated.
func ListPrimaryHeads(queries accountingRepository.PrimaryHeadsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		heads, err := queries.ListPrimaryHeads(ctx)
		if err != nil {
			applog.Error(c, handlerListPrimaryHeads, "failed to process request",
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
			Data:    utils.EnsureSlice(heads),
		})
	}
}
