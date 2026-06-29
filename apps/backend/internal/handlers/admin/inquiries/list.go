package inquiries

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const PAGE_LIMIT = 20

type ListInquiriesParams struct {
	Search string `form:"search" binding:"omitempty,min=1,max=100"`
	IsRead *bool  `form:"is_read" binding:"omitempty"`
	Source string `form:"source" binding:"omitempty,oneof=facebook tiktok instagram referral inperson"`
}

func ListInquiries(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		pageFromParams, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		if pageFromParams <= 0 {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		var filter ListInquiriesParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameters",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		sources, err := queries.ListInquirySources(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if sources == nil {
			sources = []string{}
		}

		sourceFilter := utils.ToNullableText(filter.Source)

		total, err := queries.GetInquiriesCount(ctx, db.GetInquiriesCountParams{
			Search: utils.ToNullableText(filter.Search),
			IsRead: utils.ToNullableBool(filter.IsRead),
			Source: sourceFilter,
		})
		if err != nil {
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
				Data: types.InquiriesResponse{
					Inquiries:   []db.Inquiry{},
					Sources:     sources,
					UnreadCount: 0,
					ReadCount:   0,
				},
				Meta: &types.PaginationMeta{
					Total:      0,
					TotalPages: 0,
					Limit:      PAGE_LIMIT,
				},
			})
			return
		}

		totalPages := (total + PAGE_LIMIT - 1) / PAGE_LIMIT

		if pageFromParams > int(totalPages) {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		offset := PAGE_LIMIT * (pageFromParams - 1)

		inquiries, err := queries.ListInquiries(ctx, db.ListInquiriesParams{
			Limit:  PAGE_LIMIT,
			Offset: int32(offset),
			Search: utils.ToNullableText(filter.Search),
			IsRead: utils.ToNullableBool(filter.IsRead),
			Source: sourceFilter,
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		unreadInquiriesCount, err := queries.CountUnreadInquiries(ctx)

		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		readInquiriesCount, err := queries.CountReadInquiries(ctx)

		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data: types.InquiriesResponse{
				Inquiries:   inquiries,
				Sources:     sources,
				UnreadCount: int(unreadInquiriesCount),
				ReadCount:   int(readInquiriesCount),
			},
			Meta: &types.PaginationMeta{
				Limit:      PAGE_LIMIT,
				Total:      int(total),
				TotalPages: int(totalPages),
			},
		})

	}
}
