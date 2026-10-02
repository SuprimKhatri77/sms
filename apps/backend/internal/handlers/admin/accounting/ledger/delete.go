package ledger

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	ledgertypes "github.com/suprimkhatri77/sms/backend/internal/pkg/ledger"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerDeleteLedgerEntry = "DeleteLedgerEntry"

// DeleteLedgerEntry removes a manual entry. A supplier payment's cash/bank
// side goes with it (the FK cascades). Entries a purchase or payment wrote are
// removed through that purchase or payment instead.
func DeleteLedgerEntry(queries accountingRepository.LedgerTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		entryID, err := utils.ConvertToUUID(c.Param("entryID"))
		if err != nil {
			applog.Warn(c, handlerDeleteLedgerEntry, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			respondLedgerWriteError(c, handlerDeleteLedgerEntry, err)
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		existing, err := qtx.GetLedgerEntryForUpdate(ctx, entryID)
		if err != nil {
			respondLedgerWriteError(c, handlerDeleteLedgerEntry, err)
			return
		}

		if msg := ledgertypes.LockedMessage(existing.Source); msg != "" {
			applog.Warn(c, handlerDeleteLedgerEntry, "entry not deletable",
				slog.String("source", existing.Source))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: msg,
				Code:    constants.LedgerEntryLocked,
			})
			return
		}

		if err := qtx.DeleteLedgerEntry(ctx, entryID); err != nil {
			respondLedgerWriteError(c, handlerDeleteLedgerEntry, err)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			respondLedgerWriteError(c, handlerDeleteLedgerEntry, err)
			return
		}

		applog.Info(c, handlerDeleteLedgerEntry, "ledger entry deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Ledger entry deleted",
		})
	}
}
