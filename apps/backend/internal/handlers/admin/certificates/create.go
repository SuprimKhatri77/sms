package certificates

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jaevor/go-nanoid"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

type CreateCertificateRequest struct {
	Type     string `json:"type" binding:"omitempty,oneof=normal workshop"`
	CourseID string `json:"courseId" binding:"required,uuid"`
}

func buildCertificateRemarks(certType, courseName string) string {
	if certType == "workshop" {
		return fmt.Sprintf("Workshop certificate for %s", courseName)
	}
	return fmt.Sprintf("Course certificate for %s", courseName)
}

func generateCertificateID(length int) (string, error) {
	gen, err := nanoid.CustomASCII("abcdefghijklmnopqrstuvwxyz0123456789", length)
	if err != nil {
		return "", err
	}
	return gen(), nil
}

const handlerCreateCertificate = "CreateCertificate"

const maxCertificateIDAttempts = 5

func CreateCertificate(queries repository.CertificatesRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		userID, err := utils.ConvertToUUID(c.MustGet("userID").(string))
		if err != nil {
			applog.Warn(c, handlerCreateCertificate, "invalid user ID",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid user ID",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		studentID, err := utils.ConvertToUUID(c.Param("studentID"))
		if err != nil {
			applog.Warn(c, handlerCreateCertificate, "invalid student ID",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid student ID",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req CreateCertificateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateCertificate, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		if req.Type == "" {
			req.Type = "normal"
		}

		courseID, err := utils.ConvertToUUID(req.CourseID)
		if err != nil {
			applog.Warn(c, handlerCreateCertificate, "invalid course ID",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid course ID",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		studentStatus, err := queries.GetStudentStatus(ctx, studentID)
		if err != nil {
			applog.Error(c, handlerCreateCertificate, "failed to get student by ID",
				slog.Any(applog.AttrError, err))
			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Student not found",
					Code:    constants.StudentNotFound,
				})
				return
			}
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to get student by ID",
				Code:    constants.InternalServerError,
			})
			return
		}

		if studentStatus != "active" && studentStatus != "completed" {
			applog.Warn(c, handlerCreateCertificate, "cannot issue certificate for a student with pending or rejected status",
				slog.String(applog.AttrStudentStatus, studentStatus))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Cannot issue certificate for a student with pending or rejected status",
				Code:    constants.InvalidStudentStatus,
			})
			return
		}

		courseName, err := queries.GetStudentEnrolledCourseName(ctx, db.GetStudentEnrolledCourseNameParams{
			StudentID: studentID,
			CourseID:  courseID,
		})
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerCreateCertificate, "student not enrolled in course",
					slog.String("course_id", req.CourseID))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Student is not enrolled in this course",
					Code:    constants.StudentNotEnrolledInCourse,
				})
				return
			}
			applog.Error(c, handlerCreateCertificate, "failed to get enrolled course name",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to get enrolled course name",
				Code:    constants.InternalServerError,
			})
			return
		}

		issueParams := db.IssueCertificateParams{
			StudentID:  studentID,
			CourseID:   courseID,
			CourseName: utils.ToNullableText(courseName),
			IssuedBy:   userID,
			Remarks:    utils.ToNullableText(buildCertificateRemarks(req.Type, courseName)),
			Type:       req.Type,
		}

		var certificate db.Certificate
		var issueErr error

		for attempt := range maxCertificateIDAttempts {
			certificateID, genErr := generateCertificateID(14)
			if genErr != nil {
				applog.Error(c, handlerCreateCertificate, "failed to generate certificate ID",
					slog.Any(applog.AttrError, genErr))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to generate certificate ID",
					Code:    constants.InternalServerError,
				})
				return
			}

			issueParams.ID = certificateID
			certificate, issueErr = queries.IssueCertificate(ctx, issueParams)
			if issueErr == nil {
				break
			}

			var pgErr *pgconn.PgError
			if !errors.As(issueErr, &pgErr) || pgErr.Code != "23505" {
				break
			}

			switch pgErr.ConstraintName {
			case "certificates_pkey":
				applog.Warn(c, handlerCreateCertificate, "certificate ID collision, retrying",
					slog.Int("attempt", attempt+1))
				continue
			case "certificates_student_all_courses_unique",
				"certificates_student_course_unique":
				applog.Warn(c, handlerCreateCertificate, "certificate already exists",
					slog.String(applog.AttrCertificateType, req.Type),
					slog.String("course_id", req.CourseID))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Certificate already exists",
					Code:    constants.CertificateAlreadyExists,
				})
				return
			}

			break
		}

		if issueErr != nil {
			applog.Error(c, handlerCreateCertificate, "failed to issue certificate",
				slog.Any(applog.AttrError, issueErr))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to issue certificate",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Certificate record created",
			Data:    certificate,
		})
	}
}
