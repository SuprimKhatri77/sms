package auth

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/config"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
	"golang.org/x/crypto/bcrypt"
)

func Login(
	queries repository.AuthRepository,
	cfg *config.Config,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var loginRequest types.LoginRequest
		if err := c.ShouldBindJSON(&loginRequest); err != nil {
			slog.Warn("invalid request payload", "error", err)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, loginRequest),
			})
			return
		}

		utils.TrimStruct(&loginRequest, "Password")

		slog.Info("login attempt")

		user, err := queries.GetUserByEmail(ctx, loginRequest.Email)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				slog.Warn("invalid credentials (user not found)")

				c.JSON(http.StatusUnauthorized, types.APIResponse{
					Success: false,
					Message: "Invalid credentials",
					Code:    constants.InvalidCredentials,
				})
				return
			}

			slog.Error("failed to fetch user", "error", err)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Something went wrong",
				Code:    constants.InternalServerError,
			})
			return
		}

		err = bcrypt.CompareHashAndPassword(
			[]byte(user.PasswordHash),
			[]byte(loginRequest.Password),
		)
		if err != nil {
			slog.Warn("invalid credentials (password mismatch)", "user_id", user.ID)

			c.JSON(http.StatusUnauthorized, types.APIResponse{
				Success: false,
				Message: "Invalid credentials",
				Code:    constants.InvalidCredentials,
			})
			return
		}

		slog.Info("password verified", "user_id", user.ID)

		accessClaims := jwt.MapClaims{
			"user_id": user.ID,
			"role":    user.Role,
			"email":   user.Email,
			"exp":     time.Now().Add(15 * time.Minute).Unix(),
		}

		accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
		accessTokenString, err := accessToken.SignedString([]byte(cfg.JWTAccessSecret))
		if err != nil {
			slog.Error("failed to sign access token", "error", err, "user_id", user.ID)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Something went wrong",
				Code:    constants.InternalServerError,
			})
			return
		}

		refreshClaims := jwt.MapClaims{
			"user_id": user.ID,
			"exp":     time.Now().Add(30 * 24 * time.Hour).Unix(),
		}

		refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
		refreshTokenString, err := refreshToken.SignedString([]byte(cfg.JWTRefreshSecret))
		if err != nil {
			slog.Error("failed to sign refresh token", "error", err, "user_id", user.ID)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Something went wrong",
				Code:    constants.InternalServerError,
			})
			return
		}

		expiresAt := pgtype.Timestamptz{
			Time:  time.Now().Add(30 * 24 * time.Hour),
			Valid: true,
		}

		err = queries.RevokeAllUserRefreshTokens(ctx, user.ID)
		if err != nil {
			slog.Error("failed to revoke refresh tokens", "userID", user.ID, "error", err)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Something went wrong",
				Code:    constants.InternalServerError,
			})
			return
		}

		refreshTokenHash := sha256.Sum256([]byte(refreshTokenString))
		refreshTokenHashString := fmt.Sprintf("%x", refreshTokenHash)

		_, err = queries.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
			UserID:    user.ID,
			ExpiresAt: expiresAt,
			TokenHash: refreshTokenHashString,
		})
		if err != nil {
			slog.Error("failed to store refresh token", "error", err, "user_id", user.ID)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Something went wrong",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("tokens issued", "user_id", user.ID)

		secure := cfg.GinMode == "release"
		domain := ""
		if secure {
			domain = ".sms.suprimkhatri.com.np"
		}

		c.SetCookie("access_token", accessTokenString, 15*60, "/", domain, secure, true)
		c.SetCookie("refresh_token", refreshTokenString, 30*24*60*60, "/", domain, secure, true)

		slog.Info("login successful", "user_id", user.ID)

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "logged in successfully",
		})
	}
}
