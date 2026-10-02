package categories

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

type ProductCategoryRequest struct {
	Name        string `json:"name" binding:"required,notblank,min=2,max=100"`
	Description string `json:"description" binding:"omitempty,max=500"`
	// Checked as a UUID here because utils.ToNullableUUID turns a malformed
	// ID into NULL, which would silently make the category top-level.
	ParentID string `json:"parentId" binding:"omitempty,uuid"`
}

// bindProductCategoryRequest validates again after trimming so padded input
// like "a " can't pass min=2 and then be stored as a one-character name.
func bindProductCategoryRequest(c *gin.Context, handlerName string) (ProductCategoryRequest, bool) {
	var req ProductCategoryRequest
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

// respondProductCategoryWriteError maps the database errors a create or update
// can hit to user-facing responses. The FK on parent_id doubles as the
// "parent exists" check, so a parent deleted mid-request is still reported
// cleanly.
func respondProductCategoryWriteError(c *gin.Context, handlerName string, err error) {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		var status int
		var field, message, code string
		switch {
		case pgErr.Code == "23505" && pgErr.ConstraintName == "product_categories_sibling_name_key":
			status, field, code = http.StatusConflict, "name", constants.ProductCategoryAlreadyExists
			message = "A category with that name already exists here"
		case pgErr.Code == "23503" && pgErr.ConstraintName == "product_categories_parent_id_fkey":
			status, field, code = http.StatusBadRequest, "parentId", constants.ParentProductCategoryMissing
			message = "Parent category not found"
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
			Message: "Category not found",
			Code:    constants.ProductCategoryNotFound,
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
