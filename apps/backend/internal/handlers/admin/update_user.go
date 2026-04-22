package admin

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

func UpdateUser(queries repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		requestUserID, _ := c.Get("userID") // actor (from auth middleware)

		userIDFromParam := c.Param("userID")

		userID, err := utils.ConvertToUUID(userIDFromParam)
		if err != nil {
			slog.Warn("invalid user_id param",
				"user_id_param", userIDFromParam,
				"actor_id", requestUserID,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
				"error", err,
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid user ID format",
				Code:    constants.ValidationFailed,
			})
			return
		}

		var updateUserRequest types.UpdateUserRequest
		if err := c.ShouldBindJSON(&updateUserRequest); err != nil {
			slog.Warn("invalid request payload",
				"actor_id", requestUserID,
				"target_user_id", userID,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
				"error", err,
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Errors:  validator.Parse(err, updateUserRequest),
				Code:    constants.ValidationFailed,
			})
			return
		}

		utils.TrimStruct(&updateUserRequest)

		updatedUser, err := queries.UpdateUser(ctx, db.UpdateUserParams{
			ID:    userID,
			Name:  updateUserRequest.Name,
			Email: updateUserRequest.Email,
			Role:  updateUserRequest.Role,
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				slog.Warn("email already in use",
					"actor_id", requestUserID,
					"target_user_id", userID,
					"email", updateUserRequest.Email,
					"path", c.FullPath(),
					"ip", c.ClientIP(),
				)

				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: "Email is already in use",
					Code:    constants.UserAlreadyExists,
				})
				return
			}

			slog.Error("failed to update user",
				"actor_id", requestUserID,
				"target_user_id", userID,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to update user",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("user updated successfully",
			"actor_id", requestUserID,
			"target_user_id", userID,
			"new_role", updatedUser.Role,
			"path", c.FullPath(),
			"ip", c.ClientIP(),
		)

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "User updated",
			Data: types.UserResponse{
				Name:  updatedUser.Name,
				Email: updatedUser.Email,
				Role:  updatedUser.Role,
			},
		})
	}
}
