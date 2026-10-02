package primaryheads

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

type PrimaryHeadRequest struct {
	Name        string `json:"name" binding:"required,notblank,min=2,max=100"`
	Code        string `json:"code" binding:"omitempty,max=20"`
	Description string `json:"description" binding:"omitempty,max=500"`
	// Checked as a UUID here because utils.ToNullableUUID turns a malformed
	// ID into NULL, which would silently make the head top-level.
	ParentID string `json:"parentId" binding:"omitempty,uuid"`
}

// bindPrimaryHeadRequest validates again after trimming so padded input like
// "a " can't pass min=2 and then be stored as a one-character name.
func bindPrimaryHeadRequest(c *gin.Context, handlerName string) (PrimaryHeadRequest, bool) {
	var req PrimaryHeadRequest
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
	return req, true
}

// respondPrimaryHeadWriteError maps the database errors a create or update can
// hit to user-facing responses. The FK on parent_id doubles as the "parent
// exists" check, so a parent deleted mid-request is still reported cleanly.
func respondPrimaryHeadWriteError(c *gin.Context, handlerName string, err error) {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch {
		case pgErr.Code == "23505" && pgErr.ConstraintName == "primary_heads_name_key":
			applog.Warn(c, handlerName, "conflict", slog.Any(applog.AttrError, err))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "A primary head with that name already exists",
				Code:    constants.PrimaryHeadAlreadyExists,
				Errors: []types.AppError{{
					Code:    constants.PrimaryHeadAlreadyExists,
					Field:   "name",
					Message: "A primary head with that name already exists",
				}},
			})
			return
		case pgErr.Code == "23505" && pgErr.ConstraintName == "primary_heads_code_key":
			applog.Warn(c, handlerName, "conflict", slog.Any(applog.AttrError, err))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "A primary head with that code already exists",
				Code:    constants.PrimaryHeadCodeAlreadyExists,
				Errors: []types.AppError{{
					Code:    constants.PrimaryHeadCodeAlreadyExists,
					Field:   "code",
					Message: "A primary head with that code already exists",
				}},
			})
			return
		case pgErr.Code == "23503" && pgErr.ConstraintName == "primary_heads_parent_id_fkey":
			applog.Warn(c, handlerName, "parent not found", slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Parent head not found",
				Code:    constants.ParentPrimaryHeadNotFound,
				Errors: []types.AppError{{
					Code:    constants.ParentPrimaryHeadNotFound,
					Field:   "parentId",
					Message: "Parent head not found",
				}},
			})
			return
		}
	}

	if errors.Is(err, pgx.ErrNoRows) {
		applog.Warn(c, handlerName, "resource not found", slog.Any(applog.AttrError, err))
		c.JSON(http.StatusNotFound, types.APIResponse{
			Success: false,
			Message: "Primary head not found",
			Code:    constants.PrimaryHeadNotFound,
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
