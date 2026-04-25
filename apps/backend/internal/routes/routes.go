package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/config"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	adminCourses "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/courses"
	adminPayments "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/payments"
	adminStudents "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/students"
	adminUsers "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/users"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/auth"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/courses"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/student"
	upload "github.com/suprimkhatri77/sms/backend/internal/handlers/uploads"
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

	router.POST("/uploads", upload.Upload(cfg.CldClient))

	authRouter := router.Group("/auth")

	// auth routes
	authRouter.POST("/login", auth.Login(cfg.Queries, cfg.Config))
	authRouter.POST("/logout", auth.Logout(cfg.Queries, cfg.Config))
	authRouter.POST("/refresh", auth.RotateTokens(cfg.Queries, cfg.Config))
	authRouter.POST("/bootstrap", auth.Bootstrap(cfg.Queries, cfg.Config))
	authRouter.GET("/me", middleware.RequireAuth(cfg.Config), middleware.RequireRole("admin", "superadmin"), auth.Me(cfg.Queries))

	adminRouter := router.Group("/admin", middleware.RequireAuth(cfg.Config), middleware.RequireRole("admin", "superadmin"))

	// admin/users
	adminRouter.POST("/users", adminUsers.CreateUser(cfg.Queries))
	adminRouter.GET("/users", adminUsers.GetPaginatedUsers(cfg.Queries))
	adminRouter.PUT("/users/:userID", adminUsers.UpdateUser(cfg.Queries))

	// admin/students
	adminRouter.GET("/students", adminStudents.ListStudents(cfg.Queries))

	// admin/students/:id
	adminRouter.GET("/students/:studentID/detail", adminStudents.StudentDetail(cfg.Queries))
	adminRouter.GET("/students/:studentID/courses", adminStudents.StudentEnrolledCourses(cfg.Queries))
	adminRouter.GET("/students/:studentID/payments", adminStudents.StudentPaymentDetails(cfg.Queries))
	adminRouter.PUT("/students/:studentID/status", adminStudents.UpdateStatus(cfg.Queries))
	adminRouter.POST("/students/:studentID/payments", adminPayments.AddPayment(cfg.Queries))

	// admin/courses
	adminRouter.GET("/courses", adminCourses.ListAllCourses(cfg.Queries))

	// public student routes
	studentRouter := router.Group("/students")
	studentRouter.POST("/admission", student.CreateStudent(cfg.StudentRepo, cfg.PgxPool))
	studentRouter.POST("/inquiry", student.CreateInquiry(cfg.StudentRepo))

	// public courses routes
	coursesRouter := router.Group("/courses")
	coursesRouter.GET("", courses.ListAllActiveCourses(cfg.Queries))
}
