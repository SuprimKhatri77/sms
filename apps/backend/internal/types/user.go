package types

import "github.com/jackc/pgx/v5/pgtype"

type UserResponse struct {
	ID        pgtype.UUID        `json:"id"`
	Name      string             `json:"name"`
	Email     string             `json:"email"`
	ImageUrl  pgtype.Text        `json:"imageUrl,omitempty"`
	Role      string             `json:"role"`
	CreatedAt pgtype.Timestamptz `json:"createdAt"`
}

type UpdateUserRequest struct {
	Name  string `json:"name" binding:"required,min=2,max=50,alphaspace"`
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"required,oneof=student admin"`
}
