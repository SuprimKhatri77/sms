package primaryheads

import (
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerCreatePrimaryHead = "CreatePrimaryHead"

// A brand-new head can't be anyone's ancestor, so creating one can't form a
// cycle and doesn't need the tree lock that updates take.
func CreatePrimaryHead(queries accountingRepository.PrimaryHeadsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		req, ok := bindPrimaryHeadRequest(c, handlerCreatePrimaryHead)
		if !ok {
			return
		}

		head, err := queries.CreatePrimaryHead(ctx, db.CreatePrimaryHeadParams{
			ParentID:    utils.ToNullableUUID(req.ParentID),
			Name:        req.Name,
			Code:        utils.ToNullableText(req.Code),
			Description: utils.ToNullableText(req.Description),
		})
		if err != nil {
			respondPrimaryHeadWriteError(c, handlerCreatePrimaryHead, err)
			return
		}

		applog.Info(c, handlerCreatePrimaryHead, "primary head created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Primary head created",
			Data:    head,
		})
	}
}
