package students

import (
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

const PAGE_LIMIT = 21

const handlerListStudents = "ListStudents"

func ListStudents(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		pageFromParams, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || pageFromParams <= 0 {
			pageFromParams = 1
		}

		status := c.DefaultQuery("status", "")
		shift := c.DefaultQuery("shift", "")
		batch := c.DefaultQuery("batch", "")
		course := c.DefaultQuery("course", "")
		search := c.DefaultQuery("q", "")

		filterParams := db.GetStudentsCountParams{
			Status: status,
			Shift:  shift,
			Batch:  batch,
			Course: course,
			Search: search,
		}

		total, err := queries.GetStudentsCount(ctx, filterParams)
		if err != nil {
			applog.Error(c, handlerListStudents, "failed to process request",
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
				Data:    []types.ListStudent{},
				Meta: &types.PaginationMeta{
					Limit: PAGE_LIMIT,
					Total: 0,
				},
			})
			return
		}

		totalPages := (total + PAGE_LIMIT - 1) / PAGE_LIMIT
		if pageFromParams > int(totalPages) {
			pageFromParams = int(totalPages)
		}

		offset := PAGE_LIMIT * (pageFromParams - 1)

		students, err := queries.ListStudents(ctx, db.ListStudentsParams{
			Limit:  pgtype.Int4{Int32: PAGE_LIMIT, Valid: true},
			Offset: int32(offset),
			Status: status,
			Shift:  shift,
			Batch:  batch,
			Course: course,
			Search: search,
		})
		if err != nil {
			applog.Error(c, handlerListStudents, "failed to process request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		var studentList []types.ListStudent
		for _, v := range students {
			var courses []string
			if coursesRaw, ok := v.Courses.(string); ok && coursesRaw != "" {
				courses = strings.Split(coursesRaw, ",")
			} else {
				courses = []string{}
			}
			studentList = append(studentList, types.ListStudent{
				ID:          v.ID,
				FullName:    v.FullName,
				Status:      v.Status,
				ReferenceNo: v.ReferenceNo,
				Courses:     courses,
				Phone:       v.Phone,
				Batch:       v.Batch.String,
				Shift:       v.Shift,
			})
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    studentList,
			Meta: &types.PaginationMeta{
				Limit:      PAGE_LIMIT,
				Total:      int(total),
				TotalPages: int(totalPages),
			},
		})
	}
}
