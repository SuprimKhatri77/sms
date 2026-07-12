package admin

import (
	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin/users"
	"github.com/suprimkhatri77/sms/backend/internal/routes/config"
)

func setupAdminUserRoutes(admin *gin.RouterGroup, cfg config.Config) {
	admin.POST("/users", users.CreateUser(cfg.Queries))
	admin.GET("/users", users.GetPaginatedUsers(cfg.Queries))
	// admin.PUT("/users/:userID", users.UpdateUser(cfg.Queries))
}
