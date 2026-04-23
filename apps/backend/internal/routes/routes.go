package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/config"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/auth"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/student"
	"github.com/suprimkhatri77/sms/backend/internal/middleware"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/cloudinary"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
)

type Config struct {
	Config      *config.Config
	Queries     *db.Queries
	CldClient   *cloudinary.Client
	StudentRepo repository.StudentRepository
	PgxPool     *pgxpool.Pool
}

func Setup(r *gin.Engine, cfg Config) {
	router := r.Group("/api/v1")

	authRouter := router.Group("/auth")
	authRouter.POST("/login", auth.Login(cfg.Queries, cfg.Config))
	authRouter.POST("/logout", auth.Logout(cfg.Queries, cfg.Config))
	authRouter.POST("/refresh", auth.RotateTokens(cfg.Queries, cfg.Config))
	authRouter.POST("/bootstrap", auth.Bootstrap(cfg.Queries, cfg.Config))
	authRouter.GET("/me", middleware.RequireAuth(cfg.Config), middleware.RequireRole("admin", "superadmin"), auth.Me(cfg.Queries))

	adminRouter := router.Group("/admin", middleware.RequireAuth(cfg.Config), middleware.RequireRole("admin", "superadmin"))
	adminRouter.POST("/users", admin.CreateUser(cfg.Queries))
	adminRouter.GET("/users", admin.GetPaginatedUsers(cfg.Queries))
	adminRouter.PUT("/users/:userID", admin.UpdateUser(cfg.Queries))

	studentRouter := router.Group("/students")
	studentRouter.POST("/admission", student.CreateStudent(cfg.StudentRepo, cfg.PgxPool))
	studentRouter.POST("/inquiry", student.CreateInquiry(cfg.StudentRepo))
}
