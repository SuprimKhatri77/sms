package ledger

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	ledgertypes "github.com/suprimkhatri77/sms/backend/internal/pkg/ledger"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

const handlerGetLedgerSummary = "GetLedgerSummary"

// summaryTypeOrder is the order the per-ledger totals come back in.
var summaryTypeOrder = []string{ledgertypes.TypeCash, ledgertypes.TypeBank, ledgertypes.TypeSupplier, ledgertypes.TypeSalary}

// fillLedgerSummary returns one row per ledger in view: the filtered type, or
// every type when none is picked. Types without entries get zero totals, so
// the page always has a card for each.
func fillLedgerSummary(ledgerType string, rows []db.GetLedgerSummaryRow) []db.GetLedgerSummaryRow {
	byType := make(map[string]db.GetLedgerSummaryRow, len(rows))
	for _, r := range rows {
		byType[r.LedgerType] = r
	}
	wanted := summaryTypeOrder
	if ledgerType != "" {
		wanted = []string{ledgerType}
	}
	out := make([]db.GetLedgerSummaryRow, 0, len(wanted))
	for _, t := range wanted {
		row, ok := byType[t]
		if !ok {
			row = db.GetLedgerSummaryRow{LedgerType: t}
		}
		out = append(out, row)
	}
	return out
}

// GetLedgerSummary returns credit, debit and balance (credits minus debits)
// for each ledger, over the same filters as the list.
func GetLedgerSummary(queries accountingRepository.LedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var filter LedgerFilterParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			applog.Warn(c, handlerGetLedgerSummary, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameters",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		rows, err := queries.GetLedgerSummary(ctx, filter.summaryParams())
		if err != nil {
			applog.Error(c, handlerGetLedgerSummary, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    fillLedgerSummary(filter.LedgerType, rows),
		})
	}
}
