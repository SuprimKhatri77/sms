package employees

import (
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

const handlerCreateEmployee = "CreateEmployee"

func CreateEmployee(queries accountingRepository.EmployeesRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		in, ok := bindEmployeeRequest(c, handlerCreateEmployee, false)
		if !ok {
			return
		}

		employee, err := queries.CreateEmployee(ctx, db.CreateEmployeeParams{
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
			respondEmployeeWriteError(c, handlerCreateEmployee, err)
			return
		}

		applog.Info(c, handlerCreateEmployee, "employee created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Employee added",
			Data:    employee,
		})
	}
}
