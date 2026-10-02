package accountgroups

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerDeleteAccountGroup = "DeleteAccountGroup"

// The RESTRICT foreign key is what blocks deleting a group that still has
// sub-groups, so there's no window between a "has children?" check and the delete.
func DeleteAccountGroup(queries accountingRepository.AccountGroupsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		groupID, err := utils.ConvertToUUID(c.Param("groupID"))
		if err != nil {
			applog.Warn(c, handlerDeleteAccountGroup, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		result, err := queries.DeleteAccountGroup(ctx, groupID)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23503" && pgErr.ConstraintName == "account_groups_parent_id_fkey" {
				applog.Warn(c, handlerDeleteAccountGroup, "conflict",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "Cannot delete a group that has sub-groups. Delete or move them first.",
					Code:    constants.AccountGroupHasSubGroups,
				})
				return
			}
			if errors.As(err, &pgErr) && pgErr.Code == "23503" && pgErr.ConstraintName == "ledger_entries_account_group_id_fkey" {
				applog.Warn(c, handlerDeleteAccountGroup, "conflict",
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "Cannot delete a group that ledger entries are tagged with. Re-tag those entries first.",
					Code:    constants.AccountGroupInUse,
				})
				return
			}
			applog.Error(c, handlerDeleteAccountGroup, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if result.RowsAffected() == 0 {
			applog.Warn(c, handlerDeleteAccountGroup, "resource not found")
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Account group not found",
				Code:    constants.AccountGroupNotFound,
			})
			return
		}

		applog.Info(c, handlerDeleteAccountGroup, "account group deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Account group deleted",
		})
	}
}
