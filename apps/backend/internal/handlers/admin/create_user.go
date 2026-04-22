package admin

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
	"golang.org/x/crypto/bcrypt"
)

func CreateUser(
	queries repository.AuthRepository,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		actorID, _ := c.Get("userID") // may be nil for public signup

		var req types.CreateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			slog.Warn("invalid request payload",
				"actor_id", actorID,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
				"error", err,
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req, "Password")

		_, err := queries.GetUserByEmail(ctx, req.Email)
		if err == nil {
			slog.Warn("user already exists (pre-check)",
				"actor_id", actorID,
				"email", req.Email,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "User already exists",
				Code:    constants.UserAlreadyExists,
			})
			return
		}

		if !errors.Is(err, pgx.ErrNoRows) {
			slog.Error("failed checking user existence",
				"actor_id", actorID,
				"email", req.Email,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to create user",
				Code:    constants.InternalServerError,
			})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(req.Password),
			bcrypt.DefaultCost,
		)
		if err != nil {
			slog.Error("password hashing failed",
				"actor_id", actorID,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to create user",
				Code:    constants.InternalServerError,
			})
			return
		}

		_, err = queries.CreateUser(ctx, db.CreateUserParams{
			Name:         req.Name,
			Email:        req.Email,
			PasswordHash: string(hashedPassword),
			Role:         "user",
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				slog.Warn("duplicate user on insert",
					"actor_id", actorID,
					"email", req.Email,
					"path", c.FullPath(),
					"ip", c.ClientIP(),
				)

				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "User already Exists",
					Code:    constants.UserAlreadyExists,
				})
				return
			}

			slog.Error("failed to create user",
				"actor_id", actorID,
				"email", req.Email,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to create user",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("user created successfully",
			"actor_id", actorID,
			"email", req.Email,
			"role", "user",
			"path", c.FullPath(),
			"ip", c.ClientIP(),
		)

		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "User created successful",
		})
	}
}
