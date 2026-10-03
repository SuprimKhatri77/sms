package employees

import (
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const (
	StatusActive   = "active"
	StatusInactive = "inactive"
)

// EmployeeRequest is the body for adding or editing an employee. The code
// (EMP-001, ...) is assigned by the database and can't be set. Status is
// optional when adding (new employees are active) and required when editing.
type EmployeeRequest struct {
	FullName      string  `json:"fullName" binding:"required,notblank,min=2,max=100"`
	Phone         string  `json:"phone" binding:"omitempty,nepal_phone"`
	Designation   string  `json:"designation" binding:"omitempty,max=100"`
	Address       string  `json:"address" binding:"omitempty,max=200"`
	PanNo         string  `json:"panNo" binding:"omitempty,nepal_vat"`
	Notes         string  `json:"notes" binding:"omitempty,max=500"`
	MonthlySalary float64 `json:"monthlySalary" binding:"omitempty,min=0.01,lte=10000000"`
	JoinDate      string  `json:"joinDate" binding:"omitempty,date_format"`
	JoinDateBs    string  `json:"joinDateBs" binding:"omitempty,bs_date"`
	Status        string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// employeeInput is a request that passed validation, converted to what the
// queries take.
type employeeInput struct {
	FullName      string
	Phone         pgtype.Text
	Designation   pgtype.Text
	Address       pgtype.Text
	PanNo         pgtype.Text
	Notes         pgtype.Text
	MonthlySalary pgtype.Int8
	JoinDate      pgtype.Date
	JoinDateBs    pgtype.Text
	Status        string
}

func rejectField(c *gin.Context, handlerName, field, message string) {
	applog.Warn(c, handlerName, "invalid request", slog.String("field", field))
	c.JSON(http.StatusBadRequest, types.APIResponse{
		Success: false,
		Message: message,
		Code:    constants.ValidationFailed,
		Errors:  []types.AppError{{Code: constants.ValidationFailed, Field: field, Message: message}},
	})
}

// bindEmployeeRequest validates again after trimming (so padded input can't
// pass min= and then be stored shorter) and checks the join date's BS and AD
// halves come together and agree.
func bindEmployeeRequest(c *gin.Context, handlerName string, requireStatus bool) (employeeInput, bool) {
	var req EmployeeRequest
	err := c.ShouldBindJSON(&req)
	if err == nil {
		utils.TrimStruct(&req)
		err = binding.Validator.ValidateStruct(&req)
	}
	if err != nil {
		applog.Warn(c, handlerName, "invalid request",
			slog.Any(applog.AttrError, err))
		c.JSON(http.StatusBadRequest, types.APIResponse{
			Success: false,
			Message: "Invalid request body",
			Code:    constants.ValidationFailed,
			Errors:  validator.Parse(err, req),
		})
		return employeeInput{}, false
	}

	if requireStatus && req.Status == "" {
		rejectField(c, handlerName, "status", "Choose active or inactive")
		return employeeInput{}, false
	}
	if req.Status == "" {
		req.Status = StatusActive
	}

	if (req.JoinDate == "") != (req.JoinDateBs == "") {
		rejectField(c, handlerName, "joinDateBs", "Join date needs both the BS and AD date")
		return employeeInput{}, false
	}
	joinDate := pgtype.Date{}
	if req.JoinDate != "" {
		adDate, err := time.Parse("2006-01-02", req.JoinDate)
		if err == nil {
			err = utils.ValidateBSMatchesAD(req.JoinDateBs, adDate)
		}
		if err != nil {
			applog.Warn(c, handlerName, "bs/ad date mismatch",
				slog.Any(applog.AttrError, err))
			rejectField(c, handlerName, "joinDateBs", "BS date and AD date do not match")
			return employeeInput{}, false
		}
		joinDate = pgtype.Date{Time: adDate, Valid: true}
	}

	salary := pgtype.Int8{}
	if req.MonthlySalary > 0 {
		salary = pgtype.Int8{Int64: utils.RupeesToPaisa(req.MonthlySalary), Valid: true}
	}

	return employeeInput{
		FullName:      req.FullName,
		Phone:         utils.ToNullableText(req.Phone),
		Designation:   utils.ToNullableText(req.Designation),
		Address:       utils.ToNullableText(req.Address),
		PanNo:         utils.ToNullableText(req.PanNo),
		Notes:         utils.ToNullableText(req.Notes),
		MonthlySalary: salary,
		JoinDate:      joinDate,
		JoinDateBs:    utils.ToNullableText(req.JoinDateBs),
		Status:        req.Status,
	}, true
}

// respondEmployeeWriteError maps the errors an add, edit or delete can hit to
// user-facing responses.
func respondEmployeeWriteError(c *gin.Context, handlerName string, err error) {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch {
		case pgErr.Code == "23505" && pgErr.ConstraintName == "employees_pan_no_key":
			applog.Warn(c, handlerName, "conflict", slog.Any(applog.AttrError, err))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "Another employee already has that PAN number",
				Code:    constants.PanNoAlreadyExists,
				Errors:  []types.AppError{{Code: constants.PanNoAlreadyExists, Field: "panNo", Message: "Another employee already has that PAN number"}},
			})
			return
		case pgErr.Code == "23503" && pgErr.ConstraintName == "ledger_entries_employee_id_fkey":
			applog.Warn(c, handlerName, "conflict", slog.Any(applog.AttrError, err))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "This employee has salary entries, so they can't be deleted. Mark them inactive instead.",
				Code:    constants.EmployeeInUse,
			})
			return
		}
	}

	if errors.Is(err, pgx.ErrNoRows) {
		applog.Warn(c, handlerName, "resource not found", slog.Any(applog.AttrError, err))
		c.JSON(http.StatusNotFound, types.APIResponse{
			Success: false,
			Message: "Employee not found",
			Code:    constants.EmployeeNotFound,
		})
		return
	}

	applog.Error(c, handlerName, "failed to process request",
		slog.Any(applog.AttrError, err))
	c.JSON(http.StatusInternalServerError, types.APIResponse{
		Success: false,
		Message: "Failed to process request",
		Code:    constants.InternalServerError,
	})
}

// employeeIDParam reads the :employeeID path parameter, answering 400 when
// it isn't a UUID.
func employeeIDParam(c *gin.Context, handlerName string) (pgtype.UUID, bool) {
	id, err := utils.ConvertToUUID(c.Param("employeeID"))
	if err != nil {
		applog.Warn(c, handlerName, "invalid request",
			slog.Any(applog.AttrError, err))
		c.JSON(http.StatusBadRequest, types.APIResponse{
			Success: false,
			Message: "Invalid ID format",
			Code:    constants.InvalidIDFormat,
		})
		return pgtype.UUID{}, false
	}
	return id, true
}
