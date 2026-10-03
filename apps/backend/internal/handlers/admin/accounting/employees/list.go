package employees

import (
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

const handlerListEmployees = "ListEmployees"

// likeEscaper escapes LIKE's wildcards and its escape character (\ is
// Postgres's default LIKE escape).
var likeEscaper = strings.NewReplacer(`\`, `\\`, "%", `\%`, "_", `\_`)

// ListEmployees pages through employees in code order. q matches the name or
// the code; status is active, inactive, or empty for everyone.
func ListEmployees(queries accountingRepository.EmployeesRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		const (
			defaultLimit = 20
			maxLimit     = 40
		)

		invalidQuery := func(message string, attrs ...any) {
			applog.Warn(c, handlerListEmployees, "invalid request", attrs...)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: message,
				Code:    constants.InvalidQueryParam,
			})
		}

		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			invalidQuery("Page must be a number greater than 0", slog.Any(applog.AttrError, err))
			return
		}

		limit, err := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultLimit)))
		if err != nil || limit <= 0 {
			invalidQuery("Invalid query parameter", slog.Any(applog.AttrError, err))
			return
		}
		if limit > maxLimit {
			limit = maxLimit
		}

		status := c.Query("status")
		if status != "" && status != StatusActive && status != StatusInactive {
			invalidQuery("Status must be active or inactive")
			return
		}

		// q is matched literally: % and _ would otherwise be LIKE wildcards
		q := utils.ToNullableText(likeEscaper.Replace(strings.TrimSpace(c.Query("q"))))
		statusFilter := utils.ToNullableText(status)

		total, err := queries.GetEmployeeCountFiltered(ctx, db.GetEmployeeCountFilteredParams{
			Q:      q,
			Status: statusFilter,
		})
		if err != nil {
			respondEmployeeWriteError(c, handlerListEmployees, err)
			return
		}
		// A page past the end (say the last employee on it was just marked
		// inactive) comes back empty with the real page count, so the list
		// can step back instead of failing.
		totalPages := (total + int64(limit) - 1) / int64(limit)
		if page > int(totalPages) {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Data:    []db.Employee{},
				Meta: types.PaginationMeta{
					Total:      int(total),
					TotalPages: int(totalPages),
					Limit:      limit,
					Page:       page,
				},
			})
			return
		}

		employees, err := queries.ListEmployees(ctx, db.ListEmployeesParams{
			Q:      q,
			Status: statusFilter,
			Limit:  int32(limit),
			Offset: int32((page - 1) * limit),
		})
		if err != nil {
			respondEmployeeWriteError(c, handlerListEmployees, err)
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Data:    employees,
			Meta: types.PaginationMeta{
				Total:      int(total),
				TotalPages: int(totalPages),
				Page:       page,
				Limit:      limit,
			},
		})
	}
}
