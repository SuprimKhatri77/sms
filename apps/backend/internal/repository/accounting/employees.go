package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type EmployeesRepository interface {
	CreateEmployee(ctx context.Context, params db.CreateEmployeeParams) (db.Employee, error)
	UpdateEmployee(ctx context.Context, params db.UpdateEmployeeParams) (db.Employee, error)
	DeleteEmployee(ctx context.Context, id pgtype.UUID) (int64, error)
	ListEmployees(ctx context.Context, params db.ListEmployeesParams) ([]db.Employee, error)
	GetEmployeeCountFiltered(ctx context.Context, params db.GetEmployeeCountFilteredParams) (int64, error)
}
