package accountgroups

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

type AccountGroupRequest struct {
	Name        string `json:"name" binding:"required,notblank,min=2,max=100"`
	Code        string `json:"code" binding:"omitempty,max=20"`
	Description string `json:"description" binding:"omitempty,max=500"`
	// Both IDs are checked as UUIDs here because utils.ToNullableUUID turns a
	// malformed ID into NULL, which would silently drop the link.
	ParentID      string `json:"parentId" binding:"omitempty,uuid"`
	PrimaryHeadID string `json:"primaryHeadId" binding:"omitempty,uuid"`
}

const subGroupHeadMessage = "Sub-groups inherit the primary head from their parent group"

// bindAccountGroupRequest validates again after trimming so padded input like
// "a " can't pass min=2 and then be stored as a one-character name. It also
// rejects a primary head on a sub-group outright rather than silently dropping
// it, since only root groups carry a head.
func bindAccountGroupRequest(c *gin.Context, handlerName string) (AccountGroupRequest, bool) {
	var req AccountGroupRequest
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
		return req, false
	}

	if req.ParentID != "" && req.PrimaryHeadID != "" {
		applog.Warn(c, handlerName, "primary head on sub-group")
		c.JSON(http.StatusBadRequest, types.APIResponse{
			Success: false,
			Message: subGroupHeadMessage,
			Code:    constants.SubGroupCannotHavePrimaryHead,
			Errors: []types.AppError{{
				Code:    constants.SubGroupCannotHavePrimaryHead,
				Field:   "primaryHeadId",
				Message: subGroupHeadMessage,
			}},
		})
		return req, false
	}

	return req, true
}

// respondAccountGroupWriteError maps the database errors a create or update can
// hit to user-facing responses. The FKs double as the "parent exists" and
// "head exists" checks, so a row deleted mid-request is still reported cleanly.
func respondAccountGroupWriteError(c *gin.Context, handlerName string, err error) {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		var status int
		var field, message, code string
		switch {
		case pgErr.Code == "23505" && pgErr.ConstraintName == "account_groups_name_key":
			status, field, code = http.StatusConflict, "name", constants.AccountGroupAlreadyExists
			message = "An account group with that name already exists"
		case pgErr.Code == "23505" && pgErr.ConstraintName == "account_groups_code_key":
			status, field, code = http.StatusConflict, "code", constants.AccountGroupCodeAlreadyExists
			message = "An account group with that code already exists"
		case pgErr.Code == "23503" && pgErr.ConstraintName == "account_groups_parent_id_fkey":
			status, field, code = http.StatusBadRequest, "parentId", constants.ParentAccountGroupNotFound
			message = "Parent group not found"
		case pgErr.Code == "23503" && pgErr.ConstraintName == "account_groups_primary_head_id_fkey":
			status, field, code = http.StatusBadRequest, "primaryHeadId", constants.PrimaryHeadNotFound
			message = "Primary head not found"
		case pgErr.Code == "23514" && pgErr.ConstraintName == "account_groups_head_only_on_root":
			status, field, code = http.StatusBadRequest, "primaryHeadId", constants.SubGroupCannotHavePrimaryHead
			message = subGroupHeadMessage
		}
		if status != 0 {
			applog.Warn(c, handlerName, "rejected by constraint", slog.Any(applog.AttrError, err))
			c.JSON(status, types.APIResponse{
				Success: false,
				Message: message,
				Code:    code,
				Errors:  []types.AppError{{Code: code, Field: field, Message: message}},
			})
			return
		}
	}

	if errors.Is(err, pgx.ErrNoRows) {
		applog.Warn(c, handlerName, "resource not found", slog.Any(applog.AttrError, err))
		c.JSON(http.StatusNotFound, types.APIResponse{
			Success: false,
			Message: "Account group not found",
			Code:    constants.AccountGroupNotFound,
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
