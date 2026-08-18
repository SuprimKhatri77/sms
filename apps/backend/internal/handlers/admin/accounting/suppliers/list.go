package suppliers

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

const handlerListSuppliers = "ListSuppliers"

func ListSuppliers(queries accountingRepository.SuppliersRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const (
			defaultLimit = 20
			maxLimit     = 40
		)

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil {
			applog.Warn(c, handlerListSuppliers, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		if page <= 0 {
			applog.Warn(c, handlerListSuppliers, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Page must be greater than 0",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		limit, err := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultLimit)))
		if err != nil || limit <= 0 {
			applog.Warn(c, handlerListSuppliers, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}
		if limit > maxLimit {
			limit = maxLimit
		}

		nameFilter := utils.ToNullableText(c.Query("name"))

		total, err := queries.GetSupplierCountFiltered(ctx, nameFilter)
		if err != nil {
			applog.Error(c, handlerListSuppliers, "failed to process request",
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
				Data:    []db.Supplier{},
				Meta: types.PaginationMeta{
					Total:      0,
					TotalPages: 0,
					Limit:      limit,
					Page:       page,
				},
			})
			return
		}

		totalPages := (total + int64(limit) - 1) / int64(limit)
		if page > int(totalPages) {
			applog.Warn(c, handlerListSuppliers, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		offset := (page - 1) * limit

		suppliers, err := queries.ListSuppliers(ctx, db.ListSuppliersParams{
			Limit:  int32(limit),
			Offset: int32(offset),
			Name:   nameFilter,
		})
		if err != nil {
			applog.Error(c, handlerListSuppliers, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(suppliers) == 0 {
			suppliers = []db.Supplier{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    suppliers,
			Meta: types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       page,
				Limit:      limit,
			},
		})

	}
}
