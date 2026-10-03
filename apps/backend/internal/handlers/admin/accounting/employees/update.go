package employees

import (
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

const handlerUpdateEmployee = "UpdateEmployee"

func UpdateEmployee(queries accountingRepository.EmployeesRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		employeeID, ok := employeeIDParam(c, handlerUpdateEmployee)
		if !ok {
			return
		}

		in, ok := bindEmployeeRequest(c, handlerUpdateEmployee, true)
		if !ok {
			return
		}

		employee, err := queries.UpdateEmployee(ctx, db.UpdateEmployeeParams{
			ID:            employeeID,
			FullName:      in.FullName,
			Phone:         in.Phone,
			Designation:   in.Designation,
			Address:       in.Address,
			PanNo:         in.PanNo,
			Notes:         in.Notes,
			MonthlySalary: in.MonthlySalary,
			JoinDate:      in.JoinDate,
			JoinDateBs:    in.JoinDateBs,
			Status:        in.Status,
		})
		if err != nil {
			respondEmployeeWriteError(c, handlerUpdateEmployee, err)
			return
		}

		applog.Info(c, handlerUpdateEmployee, "employee updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Employee updated",
			Data:    employee,
		})
	}
}
