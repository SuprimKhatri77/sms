package students

import (
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

const PAGE_LIMIT = 20

func ListStudents(queries repository.AdminRepository) gin.HandlerFunc {
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
			pageFromParams = 1
		}

		total, err := queries.GetStudentsCount(ctx)
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
				Data:    []db.ListStudentsRow{},
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
			Limit:  PAGE_LIMIT,
			Offset: int32(offset),
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Debug("length of students: ", "len", len(students))

		var studentList []types.ListStudent
		for _, v := range students {
			var courses []string
			if coursesRaw, ok := v.Courses.(string); ok && coursesRaw != "" {
				courses = strings.Split(coursesRaw, ",")
			} else {
				courses = []string{}
			}
			studentList = append(studentList, types.ListStudent{
				ID:            v.ID,
				FullName:      v.FullName,
				Status:        v.Status,
				ReferenceNo:   v.ReferenceNo,
				ClaimedAmount: int(v.ClaimedAmount),
				Courses:       courses,
				Phone:         v.Phone,
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
