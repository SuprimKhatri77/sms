package ledger

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

const handlerListLedgerEntries = "ListLedgerEntries"

func ListLedgerEntries(queries accountingRepository.LedgerRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const PAGE_LIMIT int64 = 40

		var filter LedgerFilterParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			applog.Warn(c, handlerListLedgerEntries, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameters",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			applog.Warn(c, handlerListLedgerEntries, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		total, err := queries.GetLedgerEntryCount(ctx, filter.countParams())
		if err != nil {
			applog.Error(c, handlerListLedgerEntries, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if total == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data:    []db.ListLedgerEntriesRow{},
				Meta: types.PaginationMeta{
					Total:      0,
					TotalPages: 0,
					Limit:      int(PAGE_LIMIT),
					Page:       page,
				},
			})
			return
		}

		totalPages := (total + PAGE_LIMIT - 1) / PAGE_LIMIT
		if page > int(totalPages) {
			applog.Warn(c, handlerListLedgerEntries, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		offset := PAGE_LIMIT * (int64(page) - 1)
		list, err := queries.ListLedgerEntries(ctx, filter.listParams(
			pgtype.Int4{Int32: int32(PAGE_LIMIT), Valid: true}, int32(offset)))
		if err != nil {
			applog.Error(c, handlerListLedgerEntries, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(list) == 0 {
			list = []db.ListLedgerEntriesRow{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    list,
			Meta: types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       page,
				Limit:      int(PAGE_LIMIT),
			},
		})
	}
}
