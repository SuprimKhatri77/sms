package primaryheads

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

const handlerDeletePrimaryHead = "DeletePrimaryHead"

// The RESTRICT foreign keys are what block deleting a head that is still in
// use, so there's no window between a "has children?" check and the delete.
func DeletePrimaryHead(queries accountingRepository.PrimaryHeadsRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		headID, err := utils.ConvertToUUID(c.Param("headID"))
		if err != nil {
			applog.Warn(c, handlerDeletePrimaryHead, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		result, err := queries.DeletePrimaryHead(ctx, headID)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				switch pgErr.ConstraintName {
				case "primary_heads_parent_id_fkey":
					applog.Warn(c, handlerDeletePrimaryHead, "conflict",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Cannot delete a head that has sub-heads. Delete or move them first.",
						Code:    constants.PrimaryHeadHasSubHeads,
					})
					return
				case "account_groups_primary_head_id_fkey":
					applog.Warn(c, handlerDeletePrimaryHead, "conflict",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Cannot delete a head that is linked to account groups. Unlink them first.",
						Code:    constants.PrimaryHeadHasAccountGroups,
					})
					return
				}
			}
			applog.Error(c, handlerDeletePrimaryHead, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if result.RowsAffected() == 0 {
			applog.Warn(c, handlerDeletePrimaryHead, "resource not found")
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Primary head not found",
				Code:    constants.PrimaryHeadNotFound,
			})
			return
		}

		applog.Info(c, handlerDeletePrimaryHead, "primary head deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Primary head deleted",
		})
	}
}
