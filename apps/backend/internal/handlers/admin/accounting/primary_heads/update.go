package primaryheads

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

const handlerUpdatePrimaryHead = "UpdatePrimaryHead"

func UpdatePrimaryHead(queries accountingRepository.PrimaryHeadTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		headID, err := utils.ConvertToUUID(c.Param("headID"))
		if err != nil {
			applog.Warn(c, handlerUpdatePrimaryHead, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		req, ok := bindPrimaryHeadRequest(c, handlerUpdatePrimaryHead)
		if !ok {
			return
		}
		parentID := utils.ToNullableUUID(req.ParentID)

		tx, err := pool.Begin(ctx)
		if err != nil {
			respondPrimaryHeadWriteError(c, handlerUpdatePrimaryHead, err)
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		// Held until commit, so the cycle check below and the update happen
		// as one step relative to any other move.
		if err := qtx.LockPrimaryHeadTree(ctx); err != nil {
			respondPrimaryHeadWriteError(c, handlerUpdatePrimaryHead, err)
			return
		}

		if parentID.Valid {
			// Also true when the parent is the head itself.
			circular, err := qtx.IsPrimaryHeadInSubtree(ctx, db.IsPrimaryHeadInSubtreeParams{
				ParentID: parentID,
				HeadID:   headID,
			})
			if err != nil {
				respondPrimaryHeadWriteError(c, handlerUpdatePrimaryHead, err)
				return
			}
			if circular {
				applog.Warn(c, handlerUpdatePrimaryHead, "circular parent")
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "A head can't be moved under itself or one of its sub-heads",
					Code:    constants.PrimaryHeadCircularParent,
					Errors: []types.AppError{{
						Code:    constants.PrimaryHeadCircularParent,
						Field:   "parentId",
						Message: "A head can't be moved under itself or one of its sub-heads",
					}},
				})
				return
			}
		}

		if _, err := qtx.UpdatePrimaryHead(ctx, db.UpdatePrimaryHeadParams{
			ID:          headID,
			ParentID:    parentID,
			Name:        req.Name,
			Code:        utils.ToNullableText(req.Code),
			Description: utils.ToNullableText(req.Description),
		}); err != nil {
			respondPrimaryHeadWriteError(c, handlerUpdatePrimaryHead, err)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			respondPrimaryHeadWriteError(c, handlerUpdatePrimaryHead, err)
			return
		}

		applog.Info(c, handlerUpdatePrimaryHead, "primary head updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Primary head updated",
		})
	}
}
