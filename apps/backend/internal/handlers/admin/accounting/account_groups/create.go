package accountgroups

import (
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerCreateAccountGroup = "CreateAccountGroup"

// A brand-new group can't be anyone's ancestor, so creating one can't form a
// cycle and doesn't need the tree lock that updates take.
func CreateAccountGroup(queries accountingRepository.AccountGroupsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		req, ok := bindAccountGroupRequest(c, handlerCreateAccountGroup)
		if !ok {
			return
		}

		group, err := queries.CreateAccountGroup(ctx, db.CreateAccountGroupParams{
			ParentID:      utils.ToNullableUUID(req.ParentID),
			PrimaryHeadID: utils.ToNullableUUID(req.PrimaryHeadID),
			Name:          req.Name,
			Code:          utils.ToNullableText(req.Code),
			Description:   utils.ToNullableText(req.Description),
		})
		if err != nil {
			respondAccountGroupWriteError(c, handlerCreateAccountGroup, err)
			return
		}

		applog.Info(c, handlerCreateAccountGroup, "account group created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Account group created",
			Data:    group,
		})
	}
}
