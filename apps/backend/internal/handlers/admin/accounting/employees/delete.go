package employees

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

const handlerDeleteEmployee = "DeleteEmployee"

// DeleteEmployee removes an employee who has no ledger entries; one with
// salary history is marked inactive instead (the FK refuses the delete).
func DeleteEmployee(queries accountingRepository.EmployeesRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		employeeID, ok := employeeIDParam(c, handlerDeleteEmployee)
		if !ok {
			return
		}

		deleted, err := queries.DeleteEmployee(ctx, employeeID)
		if err == nil && deleted == 0 {
			err = pgx.ErrNoRows
		}
		if err != nil {
			respondEmployeeWriteError(c, handlerDeleteEmployee, err)
			return
		}

		applog.Info(c, handlerDeleteEmployee, "employee deleted")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Employee deleted",
		})
	}
}
