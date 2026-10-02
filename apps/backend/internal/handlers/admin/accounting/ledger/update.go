package ledger

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	ledgertypes "github.com/suprimkhatri77/sms/backend/internal/pkg/ledger"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerUpdateLedgerEntry = "UpdateLedgerEntry"

const unpairedPaymentMessage = "This payment was recorded before cash/bank entries were linked to it, so its amount, type and payment type can't be changed. Delete it and enter it again."

// UpdateLedgerEntry edits a manual entry. Entries a purchase or payment wrote
// are changed through that purchase or payment instead, and an entry keeps
// its ledger type.
//
// A supplier payment's cash/bank side is rebuilt from the edited entry, so a
// change of amount, date, payment type or account carries over. Older payments
// that never got linked to their cash/bank side can't have their money fields
// changed: rebuilding would add a second cash/bank debit next to the old one.
func UpdateLedgerEntry(queries accountingRepository.LedgerTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		entryID, err := utils.ConvertToUUID(c.Param("entryID"))
		if err != nil {
			applog.Warn(c, handlerUpdateLedgerEntry, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		in, ok := bindLedgerEntryRequest(c, handlerUpdateLedgerEntry)
		if !ok {
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		existing, err := qtx.GetLedgerEntryForUpdate(ctx, entryID)
		if err != nil {
			respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
			return
		}

		if msg := ledgertypes.LockedMessage(existing.Source); msg != "" {
			applog.Warn(c, handlerUpdateLedgerEntry, "entry not editable",
				slog.String("source", existing.Source))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: msg,
				Code:    constants.LedgerEntryLocked,
			})
			return
		}

		if in.LedgerType != existing.LedgerType {
			rejectFields(c, handlerUpdateLedgerEntry, []types.AppError{{
				Code:    constants.LedgerTypeChange,
				Field:   "ledgerType",
				Message: "An entry can't move to another ledger; delete it and add it to the other ledger",
			}})
			return
		}

		// Only supplier entries have a cash/bank side. A supplier entry with a
		// payment type but no linked side predates the link (see the 000054
		// migration).
		var hasPair, unpairedPayment bool
		if existing.LedgerType == ledgertypes.TypeSupplier {
			if _, err := qtx.GetPairedLedgerEntry(ctx, existing.ID); err == nil {
				hasPair = true
			} else if !errors.Is(err, pgx.ErrNoRows) {
				respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
				return
			}
			unpairedPayment = !hasPair && existing.PaymentType.Valid
		}

		if unpairedPayment {
			// a credit's payment type is dropped on the way in (it moves no
			// money), so only a debit's can differ from what's stored
			paymentTypeChanged := existing.EntryType == "dr" && in.PaymentType != existing.PaymentType.String
			if in.Amount != existing.Amount || in.EntryType != existing.EntryType || paymentTypeChanged {
				applog.Warn(c, handlerUpdateLedgerEntry, "money fields changed on unpaired supplier payment")
				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: unpairedPaymentMessage,
					Code:    constants.LedgerEntryUnpaired,
				})
				return
			}
			// kept as recorded, so the entry stays recognisable as one whose
			// cash/bank side is a separate, unlinked entry
			in.PaymentType = existing.PaymentType.String
		}

		entry, err := qtx.UpdateLedgerEntry(ctx, db.UpdateLedgerEntryParams{
			ID:             entryID,
			BankAccountID:  entryBankAccount(in),
			SupplierID:     in.SupplierID,
			AccountGroupID: in.AccountGroupID,
			StockInID:      in.StockInID,
			Date:           in.Date,
			BsDate:         in.BsDate,
			EntryType:      in.EntryType,
			Amount:         in.Amount,
			Description:    in.Description,
			PaymentType:    utils.ToNullableText(in.PaymentType),
		})
		if err != nil {
			respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
			return
		}

		if existing.LedgerType == ledgertypes.TypeSupplier && !unpairedPayment {
			if hasPair {
				if err := qtx.DeletePairedLedgerEntry(ctx, entry.ID); err != nil {
					respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
					return
				}
			}
			if ledgertypes.RecordsPayment(in.LedgerType, in.EntryType, in.PaymentType) {
				if err := recordSupplierPayment(ctx, qtx, entry, in); err != nil {
					respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
					return
				}
			}
		}

		updated, err := qtx.GetLedgerEntryByID(ctx, entry.ID)
		if err != nil {
			respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			respondLedgerWriteError(c, handlerUpdateLedgerEntry, err)
			return
		}

		applog.Info(c, handlerUpdateLedgerEntry, "ledger entry updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Ledger entry updated",
			Data:    updated,
		})
	}
}
