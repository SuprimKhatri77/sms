package admin

import (
	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin/certificates"
	"github.com/suprimkhatri77/sms/backend/internal/routes/config"
)

func setupAdminCertificatesRoutes(admin *gin.RouterGroup, cfg config.Config) {
	c := admin.Group("/certificates")

	c.POST("/:studentID", certificates.CreateCertificate(cfg.Queries))
	c.GET("/:studentID", certificates.ListStudentCertificates(cfg.Queries))
}
