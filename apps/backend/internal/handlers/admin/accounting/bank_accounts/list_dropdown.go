package bankaccounts

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListBankAccountsForDropdown = "ListBankAccountsForDropdown"

func ListBankAccountsForDropdown(queries accountingRepository.BankAccountRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var limit pgtype.Int4
		if limitRaw := c.Query("limit"); limitRaw != "" {
			if n, err := strconv.Atoi(limitRaw); err == nil && n > 0 {
				limit = pgtype.Int4{Int32: int32(n), Valid: true}
			}
		}

		accounts, err := queries.ListBankAccountsForDropdown(ctx, db.ListBankAccountsForDropdownParams{
			Name:  utils.ToNullableText(c.Query("name")),
			Limit: limit,
		})
		if err != nil {
			applog.Error(c, handlerListBankAccountsForDropdown, "failed to process request",
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
			Data:    accounts,
		})
	}
}
