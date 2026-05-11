package types

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AppError struct {
	Code    string `json:"code"`
	Field   string `json:"field,omitempty"`
	Message string `json:"message"`
}

type APIResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message,omitempty"`
	Code    string          `json:"code,omitempty"`
	Errors  []AppError      `json:"errors,omitempty"`
	Data    any             `json:"data,omitempty"`
	Meta    *PaginationMeta `json:"meta,omitempty"`
}

type PaginationMeta struct {
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
	Page       int `json:"page,omitempty"`
	Limit      int `json:"limit"`
}

type User struct {
	ID       pgtype.UUID `json:"id"`
	Name     string      `json:"name"`
	Role     string      `json:"role"`
	Email    string      `json:"email"`
	ImageUrl string      `json:"imageUrl"`
}

type UserResponse struct {
	User db.User `json:"user"`
}
