package accountgroups

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerUpdateAccountGroup = "UpdateAccountGroup"

// Moving a root group under a parent clears its own primary head (the request
// can't carry one for a sub-group), so from then on it inherits the new root's.
func UpdateAccountGroup(queries accountingRepository.AccountGroupTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		groupID, err := utils.ConvertToUUID(c.Param("groupID"))
		if err != nil {
			applog.Warn(c, handlerUpdateAccountGroup, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		req, ok := bindAccountGroupRequest(c, handlerUpdateAccountGroup)
		if !ok {
			return
		}
		parentID := utils.ToNullableUUID(req.ParentID)

		tx, err := pool.Begin(ctx)
		if err != nil {
			respondAccountGroupWriteError(c, handlerUpdateAccountGroup, err)
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		// Held until commit, so the cycle check below and the update happen
		// as one step relative to any other move.
		if err := qtx.LockAccountGroupTree(ctx); err != nil {
			respondAccountGroupWriteError(c, handlerUpdateAccountGroup, err)
			return
		}

		if parentID.Valid {
			// Also true when the parent is the group itself.
			circular, err := qtx.IsAccountGroupInSubtree(ctx, db.IsAccountGroupInSubtreeParams{
				ParentID: parentID,
				GroupID:  groupID,
			})
			if err != nil {
				respondAccountGroupWriteError(c, handlerUpdateAccountGroup, err)
				return
			}
			if circular {
				applog.Warn(c, handlerUpdateAccountGroup, "circular parent")
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "A group can't be moved under itself or one of its sub-groups",
					Code:    constants.AccountGroupCircularParent,
					Errors: []types.AppError{{
						Code:    constants.AccountGroupCircularParent,
						Field:   "parentId",
						Message: "A group can't be moved under itself or one of its sub-groups",
					}},
				})
				return
			}
		}

		if _, err := qtx.UpdateAccountGroup(ctx, db.UpdateAccountGroupParams{
			ID:            groupID,
			ParentID:      parentID,
			PrimaryHeadID: utils.ToNullableUUID(req.PrimaryHeadID),
			Name:          req.Name,
			Code:          utils.ToNullableText(req.Code),
			Description:   utils.ToNullableText(req.Description),
		}); err != nil {
			respondAccountGroupWriteError(c, handlerUpdateAccountGroup, err)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			respondAccountGroupWriteError(c, handlerUpdateAccountGroup, err)
			return
		}

		applog.Info(c, handlerUpdateAccountGroup, "account group updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Account group updated",
		})
	}
}
