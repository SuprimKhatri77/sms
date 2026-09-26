package wastage

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListWastageStock = "ListWastageStock"

type ListWastageStockParams struct {
	ProductName string `form:"product_name"`
	From        string `form:"from"`
	To          string `form:"to"`
	SortByRate  string `form:"sort_by_rate"`
}

func ListWastageStock(queries repository.InventoryRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const LIMIT = 20

		var filter ListWastageStockParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			applog.Warn(c, handlerListWastageStock, "invalid request",
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
			applog.Warn(c, handlerListWastageStock, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		total, err := queries.GetWastageCount(ctx, db.GetWastageCountParams{
			ProductName: utils.ToNullableText(filter.ProductName),
			From:        utils.ToNullableText(filter.From),
			To:          utils.ToNullableText(filter.To),
		})
		if err != nil {
			applog.Error(c, handlerListWastageStock, "failed to process request",
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
				Data:    []db.ListWastageRow{},
				Meta: &types.PaginationMeta{
					Total:      int(total),
					Limit:      LIMIT,
					TotalPages: 0,
					Page:       page,
				},
			})
			return
		}

		totalPages := (total + LIMIT - 1) / LIMIT
		if page > int(totalPages) {
			applog.Warn(c, handlerListWastageStock, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter value",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		offset := LIMIT * (page - 1)

		wastageList, err := queries.ListWastage(ctx, db.ListWastageParams{
			Limit:       pgtype.Int4{Int32: LIMIT, Valid: true},
			Offset:      int32(offset),
			ProductName: utils.ToNullableText(filter.ProductName),
			From:        utils.ToNullableText(filter.From),
			To:          utils.ToNullableText(filter.To),
			SortByRate:  utils.ToNullableText(filter.SortByRate),
		})

		if err != nil {
			applog.Error(c, handlerListWastageStock, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(wastageList) == 0 {
			wastageList = []db.ListWastageRow{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    wastageList,
			Meta: &types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       page,
				Limit:      LIMIT,
			},
		})

	}
}
