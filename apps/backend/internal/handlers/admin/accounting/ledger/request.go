package ledger

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	ledgertypes "github.com/suprimkhatri77/sms/backend/internal/pkg/ledger"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

// LedgerEntryRequest is the body for creating or editing an entry. Which of
// the optional IDs apply depends on the ledger type (see pkg/ledger.Types).
// The IDs are checked as UUIDs here because utils.ToNullableUUID turns a
// malformed one into NULL, which would silently drop the link.
type LedgerEntryRequest struct {
	LedgerType     string  `json:"ledgerType" binding:"required,oneof=cash bank supplier"`
	Date           string  `json:"date" binding:"required,date_format"`
	BsDate         string  `json:"bsDate" binding:"required,bs_date"`
	EntryType      string  `json:"entryType" binding:"required,oneof=cr dr"`
	Amount         float64 `json:"amount" binding:"required,min=0.01,lte=10000000"`
	Description    string  `json:"description" binding:"omitempty,notblank,min=5,max=200"`
	BankAccountID  string  `json:"bankAccountID" binding:"omitempty,uuid"`
	SupplierID     string  `json:"supplierID" binding:"omitempty,uuid"`
	AccountGroupID string  `json:"accountGroupID" binding:"omitempty,uuid"`
	PaymentType    string  `json:"paymentType" binding:"omitempty,oneof=cash bank"`
	StockInID      string  `json:"stockInID" binding:"omitempty,uuid"`
}

// ledgerEntryInput is a request that passed validation, converted to what the
// queries take.
type ledgerEntryInput struct {
	LedgerType  string
	Date        pgtype.Timestamptz
	BsDate      string
	EntryType   string
	Amount      int64
	Description pgtype.Text
	// a bank entry's account; on a supplier payment by bank, the account the
	// money left from (stored on the paired bank entry, not the supplier one)
	BankAccountID  pgtype.UUID
	SupplierID     pgtype.UUID
	AccountGroupID pgtype.UUID
	PaymentType    string
	StockInID      pgtype.UUID
}

func rejectFields(c *gin.Context, handlerName string, fieldErrs []types.AppError) {
	applog.Warn(c, handlerName, "invalid ledger entry fields")
	c.JSON(http.StatusBadRequest, types.APIResponse{
		Success: false,
		Message: fieldErrs[0].Message,
		Code:    fieldErrs[0].Code,
		Errors:  fieldErrs,
	})
}

// bindLedgerEntryRequest validates again after trimming (so padded input
// can't pass min= and then be stored shorter), checks the BS and AD dates
// agree, and checks the type-specific fields against the ledger type.
func bindLedgerEntryRequest(c *gin.Context, handlerName string) (ledgerEntryInput, bool) {
	var req LedgerEntryRequest
	err := c.ShouldBindJSON(&req)
	if err == nil {
		utils.TrimStruct(&req)
		err = binding.Validator.ValidateStruct(&req)
	}
	if err != nil {
		applog.Warn(c, handlerName, "invalid request",
			slog.Any(applog.AttrError, err))
		c.JSON(http.StatusBadRequest, types.APIResponse{
			Success: false,
			Message: "Invalid request body",
			Code:    constants.ValidationFailed,
			Errors:  validator.Parse(err, req),
		})
		return ledgerEntryInput{}, false
	}

	adDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		applog.Warn(c, handlerName, "invalid request",
			slog.Any(applog.AttrError, err))
		c.JSON(http.StatusBadRequest, types.APIResponse{
			Success: false,
			Message: "Invalid date format",
			Code:    constants.ValidationFailed,
		})
		return ledgerEntryInput{}, false
	}
	if err := utils.ValidateBSMatchesAD(req.BsDate, adDate); err != nil {
		applog.Warn(c, handlerName, "bs/ad date mismatch",
			slog.Any(applog.AttrError, err))
		c.JSON(http.StatusBadRequest, types.APIResponse{
			Success: false,
			Message: "BS date and AD date do not match",
			Code:    constants.ValidationFailed,
		})
		return ledgerEntryInput{}, false
	}

	// A credit only records what's owed; no money moves, so it has no
	// payment type (the same as the credits purchases record).
	if req.EntryType == "cr" {
		req.PaymentType = ""
	}

	var fieldErrs []types.AppError
	for _, fe := range ledgertypes.Validate(req.LedgerType, ledgertypes.Fields{
		BankAccount:  req.BankAccountID != "",
		Supplier:     req.SupplierID != "",
		AccountGroup: req.AccountGroupID != "",
		PaymentType:  req.PaymentType != "",
		StockIn:      req.StockInID != "",
	}) {
		fieldErrs = append(fieldErrs, types.AppError{Code: constants.InvalidLedgerFields, Field: fe.Field, Message: fe.Message})
	}
	if req.LedgerType == ledgertypes.TypeSupplier && req.EntryType == "dr" && req.PaymentType == "" {
		fieldErrs = append(fieldErrs, types.AppError{Code: constants.InvalidLedgerFields, Field: "paymentType", Message: "Choose how the supplier was paid"})
	}
	if len(fieldErrs) > 0 {
		rejectFields(c, handlerName, fieldErrs)
		return ledgerEntryInput{}, false
	}

	in := ledgerEntryInput{
		LedgerType:     req.LedgerType,
		Date:           pgtype.Timestamptz{Time: adDate, Valid: true},
		BsDate:         req.BsDate,
		EntryType:      req.EntryType,
		Amount:         utils.RupeesToPaisa(req.Amount),
		Description:    utils.ToNullableText(req.Description),
		SupplierID:     utils.ToNullableUUID(req.SupplierID),
		AccountGroupID: utils.ToNullableUUID(req.AccountGroupID),
		BankAccountID:  utils.ToNullableUUID(req.BankAccountID),
		PaymentType:    req.PaymentType,
		StockInID:      utils.ToNullableUUID(req.StockInID),
	}
	return in, true
}

// rejectMissingPaidFromAccount refuses a supplier payment by bank that
// doesn't say which account the money left from. It reports whether it
// refused.
func rejectMissingPaidFromAccount(c *gin.Context, handlerName string, in ledgerEntryInput) bool {
	if !ledgertypes.RecordsPayment(in.LedgerType, in.EntryType, in.PaymentType) ||
		in.PaymentType != ledgertypes.PaymentBank || in.BankAccountID.Valid {
		return false
	}
	rejectFields(c, handlerName, []types.AppError{{
		Code:    constants.InvalidLedgerFields,
		Field:   "bankAccountID",
		Message: "Choose the bank account it was paid from",
	}})
	return true
}

// paymentDescription is the description on the cash/bank debit recorded when
// a supplier is paid.
func paymentDescription(companyName string) string {
	return fmt.Sprintf("Supplier payment - %s", companyName)
}

// recordSupplierPayment writes the cash or bank side of a supplier payment
// and links it to the supplier entry. Cash and bank ledgers read like a
// statement (cr = money in, dr = money out), so paying a supplier is a dr
// there too.
func recordSupplierPayment(ctx context.Context, qtx accountingRepository.LedgerTxRepository, entry db.LedgerEntry, in ledgerEntryInput) error {
	supplier, err := qtx.GetSupplierByID(ctx, entry.SupplierID)
	if err != nil {
		return err
	}

	counterType := ledgertypes.CounterLedger(in.PaymentType)
	var bankAccountID pgtype.UUID
	if counterType == ledgertypes.TypeBank {
		bankAccountID = in.BankAccountID
	}

	_, err = qtx.CreateLedgerEntry(ctx, db.CreateLedgerEntryParams{
		LedgerType:    counterType,
		Source:        ledgertypes.SourceSupplierPayment,
		BankAccountID: bankAccountID,
		PairedEntryID: entry.ID,
		Date:          entry.Date,
		BsDate:        entry.BsDate,
		EntryType:     "dr",
		Amount:        entry.Amount,
		Description:   pgtype.Text{String: paymentDescription(supplier.CompanyName), Valid: true},
	})
	return err
}

// respondLedgerWriteError maps the errors a create, update or delete can hit
// to user-facing responses. The FKs double as the "does it exist" checks, so a
// row deleted mid-request is still reported cleanly.
func respondLedgerWriteError(c *gin.Context, handlerName string, err error) {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23503" {
		var field, message, code string
		switch pgErr.ConstraintName {
		case "ledger_entries_supplier_id_fkey":
			field, code, message = "supplierID", constants.SupplierNotFound, "Supplier not found"
		case "ledger_entries_bank_account_id_fkey":
			field, code, message = "bankAccountID", constants.BankAccountNotFound, "Bank account not found"
		case "ledger_entries_account_group_id_fkey":
			field, code, message = "accountGroupID", constants.AccountGroupNotFound, "Account group not found"
		case "ledger_entries_stock_in_id_fkey":
			field, code, message = "stockInID", constants.StockNotFound, "Purchase not found"
		}
		if code != "" {
			applog.Warn(c, handlerName, "resource not found", slog.Any(applog.AttrError, err))
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: message,
				Code:    code,
				Errors:  []types.AppError{{Code: code, Field: field, Message: message}},
			})
			return
		}
	}

	if errors.Is(err, pgx.ErrNoRows) {
		applog.Warn(c, handlerName, "resource not found", slog.Any(applog.AttrError, err))
		c.JSON(http.StatusNotFound, types.APIResponse{
			Success: false,
			Message: "Ledger entry not found",
			Code:    constants.LedgerEntryNotFound,
		})
		return
	}

	applog.Error(c, handlerName, "failed to process request",
		slog.Any(applog.AttrError, err))
	c.JSON(http.StatusInternalServerError, types.APIResponse{
		Success: false,
		Message: "Failed to process request",
		Code:    constants.InternalServerError,
	})
}
