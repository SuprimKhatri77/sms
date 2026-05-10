package repository

import (
	"context"

	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type UserRepository interface {
	GetPaginatedUsers(ctx context.Context, params db.GetPaginatedUsersParams) ([]db.GetPaginatedUsersRow, error)
	GetUsersCount(ctx context.Context) (int64, error)
	UpdateUser(ctx context.Context, params db.UpdateUserParams) (db.User, error)
}
