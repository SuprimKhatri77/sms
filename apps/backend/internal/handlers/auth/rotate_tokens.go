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

		claims, ok := token.Claims.(jwt.MapClaims)
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

		sessionIDFromClaims, ok := claims["session_id"].(string)
		slog.Info("session from claims", "", sessionIDFromClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, types.APIResponse{
				Success: false,
				Message: "Invalid token claims",
				Code:    constants.InvalidToken,
			})
			return
		}

		sessionID, err := utils.ConvertToUUID(sessionIDFromClaims)
		if err != nil {
			c.JSON(http.StatusUnauthorized, types.APIResponse{
				Success: false,
				Message: "Invalid token claims",
				Code:    constants.InvalidToken,
			})
			return
		}

		refreshTokenHash := sha256.Sum256([]byte(refreshTokenString))
		refreshTokenHashString := fmt.Sprintf("%x", refreshTokenHash)

		refreshToken, err := queries.GetRefreshToken(ctx, db.GetRefreshTokenParams{
			SessionID: sessionID,
			TokenHash: refreshTokenHashString,
		})
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				utils.SetAuthCookie(c, "access_token", "", -1, cfg)
				utils.SetAuthCookie(c, "refresh_token", "", -1, cfg)

				c.JSON(http.StatusUnauthorized, types.APIResponse{
					Success: false,
					Message: "Invalid refresh token",
					Code:    constants.InvalidRefreshToken,
				})
				return
			}

			slog.Error("failed to fetch refresh token", "error", err, "ip", c.ClientIP())

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Something went wrong",
				Code:    constants.InternalServerError,
			})
			return
		}

		err = queries.RevokeRefreshToken(ctx, db.RevokeRefreshTokenParams{
			SessionID: sessionID,
			TokenHash: refreshTokenHashString,
		})
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
			"user_id":    user.ID,
			"session_id": sessionID,
			"exp":        time.Now().Add(30 * 24 * time.Hour).Unix(),
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
			SessionID: sessionID,
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

		utils.SetAuthCookie(c, "access_token", accessTokenString, 15*60, cfg)
		utils.SetAuthCookie(c, "refresh_token", newRefreshTokenString, 30*24*60*60, cfg)

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
