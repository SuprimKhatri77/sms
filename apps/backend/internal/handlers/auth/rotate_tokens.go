package auth

import (
	"crypto/sha256"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/config"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

func RotateTokens(queries repository.AuthRepository, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		refreshTokenString, err := c.Cookie("refresh_token")
		if err != nil {
			slog.Warn("missing refresh token cookie",
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Missing refresh token",
				Code:    constants.MissingRefreshToken,
			})
			return
		}

		token, err := jwt.Parse(refreshTokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				slog.Error("unexpected signing method",
					"alg", token.Header["alg"],
				)
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(cfg.JWTRefreshSecret), nil
		})

		if err != nil || !token.Valid {
			slog.Warn("invalid refresh token",
				"error", err,
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusUnauthorized, types.APIResponse{
				Success: false,
				Message: "Invalid refresh token",
				Code:    constants.InvalidRefreshToken,
			})
			return
		}

		_, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			slog.Warn("invalid token claims",
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusUnauthorized, types.APIResponse{
				Success: false,
				Message: "Invalid token",
				Code:    constants.InvalidToken,
			})
			return
		}

		refreshTokenHash := sha256.Sum256([]byte(refreshTokenString))
		refreshTokenHashString := fmt.Sprintf("%x", refreshTokenHash)

		refreshToken, err := queries.GetRefreshToken(ctx, refreshTokenHashString)
		if err != nil {
			slog.Warn("refresh token not found in DB",
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusUnauthorized, types.APIResponse{
				Success: false,
				Message: "Invalid refresh token",
				Code:    constants.InvalidRefreshToken,
			})
			return
		}

		err = queries.RevokeRefreshToken(ctx, refreshTokenHashString)
		if err != nil {
			slog.Error("failed to revoke refresh token",
				"error", err,
				"user_id", refreshToken.UserID,
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		user, err := queries.GetUserByID(ctx, refreshToken.UserID)
		if err != nil {
			slog.Error("failed to fetch user",
				"error", err,
				"user_id", refreshToken.UserID,
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		accessClaims := jwt.MapClaims{
			"user_id": user.ID,
			"email":   user.Email,
			"role":    user.Role,
			"exp":     time.Now().Add(15 * time.Minute).Unix(),
		}

		accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
		accessTokenString, err := accessToken.SignedString([]byte(cfg.JWTAccessSecret))
		if err != nil {
			slog.Error("failed to sign access token",
				"error", err,
				"user_id", user.ID,
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		refreshClaims := jwt.MapClaims{
			"user_id": user.ID,
			"exp":     time.Now().Add(30 * 24 * time.Hour).Unix(),
		}

		newRefreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
		newRefreshTokenString, err := newRefreshToken.SignedString([]byte(cfg.JWTRefreshSecret))
		if err != nil {
			slog.Error("failed to sign refresh token",
				"error", err,
				"user_id", user.ID,
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		newHash := sha256.Sum256([]byte(newRefreshTokenString))
		newTokenHash := fmt.Sprintf("%x", newHash)

		_, err = queries.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
			UserID:    user.ID,
			TokenHash: newTokenHash,
			ExpiresAt: pgtype.Timestamptz{
				Time:  time.Now().Add(30 * 24 * time.Hour),
				Valid: true,
			},
		})
		if err != nil {
			slog.Error("failed to persist new refresh token",
				"error", err,
				"user_id", user.ID,
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		secure := cfg.GinMode == "release"
		domain := ""
		if secure {
			domain = ".sms.suprimkhatri.com.np"
		}

		c.SetCookie("access_token", accessTokenString, 15*60, "/", domain, secure, true)
		c.SetCookie("refresh_token", refreshTokenString, 30*24*60*60, "/", domain, secure, true)

		slog.Info("tokens rotated successfully",
			"user_id", user.ID,
			"ip", c.ClientIP(),
		)

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Tokens refreshed.",
		})
	}
}
