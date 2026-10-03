package ledger

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	ledgertypes "github.com/suprimkhatri77/sms/backend/internal/pkg/ledger"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerCreateLedgerEntry = "CreateLedgerEntry"

// entryBankAccount is the bank account stored on the entry itself: only bank
// entries have one. A supplier or employee paid by bank keeps it on the
// paired bank entry.
func entryBankAccount(in ledgerEntryInput) pgtype.UUID {
	if in.LedgerType == ledgertypes.TypeBank {
		return in.BankAccountID
	}
	return pgtype.UUID{}
}

// CreateLedgerEntry records a manual entry in any ledger. A supplier or
// salary payment (a debit paid by cash or bank) also records the matching
// cash or bank debit in the same transaction, linked to it. Salary can't be
// booked to an employee who is marked inactive.
func CreateLedgerEntry(queries accountingRepository.LedgerTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		in, ok := bindLedgerEntryRequest(c, handlerCreateLedgerEntry)
		if !ok || rejectMissingPaidFromAccount(c, handlerCreateLedgerEntry, in) {
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			respondLedgerWriteError(c, handlerCreateLedgerEntry, err)
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		if in.EmployeeID.Valid && rejectUnavailableEmployee(c, handlerCreateLedgerEntry, qtx, in.EmployeeID) {
			return
		}

		entry, err := qtx.CreateLedgerEntry(ctx, db.CreateLedgerEntryParams{
			LedgerType:     in.LedgerType,
			Source:         ledgertypes.SourceManual,
			BankAccountID:  entryBankAccount(in),
			SupplierID:     in.SupplierID,
			EmployeeID:     in.EmployeeID,
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
			respondLedgerWriteError(c, handlerCreateLedgerEntry, err)
			return
		}

		if ledgertypes.RecordsPayment(in.LedgerType, in.EntryType, in.PaymentType) {
			if err := recordPayment(ctx, qtx, entry, in); err != nil {
				respondLedgerWriteError(c, handlerCreateLedgerEntry, err)
				return
			}
		}

		created, err := qtx.GetLedgerEntryByID(ctx, entry.ID)
		if err != nil {
			respondLedgerWriteError(c, handlerCreateLedgerEntry, err)
			return
		}

		if err := tx.Commit(ctx); err != nil {
			respondLedgerWriteError(c, handlerCreateLedgerEntry, err)
			return
		}

		applog.Info(c, handlerCreateLedgerEntry, "ledger entry created",
			slog.String("ledger_type", in.LedgerType))
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Ledger entry created",
			Data:    created,
		})
	}
}
