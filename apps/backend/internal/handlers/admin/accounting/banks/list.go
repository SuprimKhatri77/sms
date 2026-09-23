package banks

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListBanks = "ListBanks"

func ListBanks(queries accountingRepository.BankRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		const PAGE_LIMIT int64 = 20

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil {
			applog.Warn(c, handlerListBanks, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		nameFilter := utils.ToNullableText(c.Query("name"))

		total, err := queries.GetBanksCount(ctx, nameFilter)
		if err != nil {
			applog.Error(c, handlerListBanks, "failed to process request",
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
				Data:    []db.Bank{},
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
			applog.Warn(c, handlerListBanks, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		offset := PAGE_LIMIT * int64(page-1)

		banks, err := queries.ListBanks(ctx, db.ListBanksParams{
			Limit:  int32(PAGE_LIMIT),
			Offset: int32(offset),
			Name:   nameFilter,
		})

		if err != nil {
			applog.Error(c, handlerListBanks, "failed to process request",
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
			Data:    banks,
			Meta: types.PaginationMeta{
				Limit:      int(PAGE_LIMIT),
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       page,
			},
		})

	}
}
