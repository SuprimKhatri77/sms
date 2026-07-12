package users

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

const handlerGetPaginatedUsers = "GetPaginatedUsers"

type GetPaginatedUsersParams struct {
	Role   string `form:"role"`
	Search string `form:"search"`
}
type UsersPaginationMeta struct {
	Total      int        `json:"total"`
	TotalPages int        `json:"totalPages"`
	Page       int        `json:"page"`
	Offset     int        `json:"offset"`
	Limit      int        `json:"limit"`
	RoleCounts RoleCounts `json:"roleCounts"`
}
type RoleCounts struct {
	Student    int64 `json:"student"`
	Admin      int64 `json:"admin"`
	Instructor int64 `json:"instructor"`
}

const PAGE_LIMIT int64 = 20

func GetPaginatedUsers(queries repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var filter GetPaginatedUsersParams
		if err := c.ShouldBindQuery(&filter); err != nil {
			applog.Warn(c, handlerGetPaginatedUsers, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid query parameters",
				Code:    constants.InvalidQueryParam,
			})
			return
		}

		pageFromParams, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || pageFromParams <= 0 {
			applog.Warn(c, handlerGetPaginatedUsers, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		var roleFilter pgtype.Text
		if filter.Role != "" {
			roleFilter = pgtype.Text{String: filter.Role, Valid: true}
		} else {
			roleFilter = pgtype.Text{Valid: false}
		}

		roleCounts, err := queries.GetUsersRoleCount(ctx)
		if err != nil {
			applog.Error(c, handlerGetPaginatedUsers, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		roleCountMap := map[string]int{"student": 0, "admin": 0, "instructor": 0}
		total := 0
		for _, r := range roleCounts {
			roleCountMap[r.Role] = int(r.Count)
			total += int(r.Count)
		}

		if total == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data:    []db.User{},
				Meta: UsersPaginationMeta{
					Total:      0,
					TotalPages: 0,
					Limit:      int(PAGE_LIMIT),
					Offset:     0,
					RoleCounts: RoleCounts{
						Student:    int64(roleCountMap["student"]),
						Admin:      int64(roleCountMap["admin"]),
						Instructor: int64(roleCountMap["instructor"]),
					},
				},
			})
			return
		}

		filteredCount := int64(total)
		if filter.Role != "" {
			filteredCount = int64(roleCountMap[filter.Role])
		}
		if filteredCount == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data:    []db.GetPaginatedUsersRow{},
				Meta: UsersPaginationMeta{
					Limit:      int(PAGE_LIMIT),
					Total:      int(total),
					TotalPages: 0,
					Offset:     0,
					RoleCounts: RoleCounts{
						Student:    int64(roleCountMap["student"]),
						Admin:      int64(roleCountMap["admin"]),
						Instructor: int64(roleCountMap["instructor"]),
					},
				},
			})
			return
		}

		totalPages := (filteredCount + PAGE_LIMIT - 1) / PAGE_LIMIT
		if pageFromParams > int(totalPages) {
			applog.Warn(c, handlerGetPaginatedUsers, "invalid request")
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid page parameter",
				Code:    constants.InvalidPageParam,
			})
			return
		}

		offset := PAGE_LIMIT * (int64(pageFromParams) - 1)

		users, err := queries.GetPaginatedUsers(ctx, db.GetPaginatedUsersParams{
			Limit:  int32(PAGE_LIMIT),
			Offset: int32(offset),
			Search: utils.ToNullableText(filter.Search),
			Role:   roleFilter,
		})

		if err != nil {
			applog.Error(c, handlerGetPaginatedUsers, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if len(users) == 0 {
			users = []db.GetPaginatedUsersRow{}
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    users,
			Meta: UsersPaginationMeta{
				Limit:      int(PAGE_LIMIT),
				Total:      int(total),
				TotalPages: int(totalPages),
				Offset:     int(offset),
				RoleCounts: RoleCounts{
					Student:    int64(roleCountMap["student"]),
					Admin:      int64(roleCountMap["admin"]),
					Instructor: int64(roleCountMap["instructor"]),
				},
			},
		})
	}
}
