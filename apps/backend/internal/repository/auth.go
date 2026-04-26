package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type AuthRepository interface {
	CreateUser(ctx context.Context, params db.CreateUserParams) (db.User, error)
	CreateRefreshToken(ctx context.Context, params db.CreateRefreshTokenParams) (db.RefreshToken, error)
	GetUserByEmail(ctx context.Context, email string) (db.User, error)
	GetRefreshToken(ctx context.Context, params db.GetRefreshTokenParams) (db.RefreshToken, error)
	GetUserByID(ctx context.Context, userID pgtype.UUID) (db.User, error)
	RevokeRefreshToken(ctx context.Context, params db.RevokeRefreshTokenParams) error
}
