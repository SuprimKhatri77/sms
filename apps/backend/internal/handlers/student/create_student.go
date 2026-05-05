package student

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

type Setting struct {
	RefPrefix  string
	FiscalYear string
}

func CreateStudent(queries repository.StudentRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		userIDFromContext := c.MustGet("userID").(string)
		userID, err := utils.ConvertToUUID(userIDFromContext)

		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid user ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.CreateStudentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			slog.Warn("invalid request payload",
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

		utils.TrimStruct(&req)

		dob, err := time.Parse("2006-01-02", req.DOB)
		if err != nil {
			slog.Warn("invalid dob format",
				"dob", req.DOB,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid date format",
				Code:    constants.ValidationFailed,
			})
			return
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			slog.Error("failed to begin transaction",
				"path", c.FullPath(),
				"ip", c.ClientIP(),
				"error", err,
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		settingsData, err := qtx.GetAdmissionSettings(ctx)
		if err != nil {
			slog.Error("failed to fetch admission settings",
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		settings := &Setting{}
		for _, v := range settingsData {
			switch v.Key {
			case "ref_prefix":
				settings.RefPrefix = v.Value
			case "fiscal_year":
				settings.FiscalYear = v.Value
			}
		}

		serialNo, err := qtx.GetNextSerialNo(ctx, settings.FiscalYear)
		if err != nil {
			slog.Error("failed to generate serial number",
				"fiscal_year", settings.FiscalYear,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		referenceNumber := fmt.Sprintf("%s/%s/%d", settings.RefPrefix, settings.FiscalYear, serialNo)

		student, err := qtx.CreateStudent(ctx, db.CreateStudentParams{
			FullName:      req.FullName,
			Gender:        req.Gender,
			GuardianName:  req.GuardianName,
			GuardianPhone: req.GuardianPhone,
			ClaimedAmount: int32(req.ClaimedAmount * 100),
			Phone:         req.Phone,
			PhotoUrl:      pgtype.Text{String: req.PhotoUrl, Valid: true},
			Source:        req.Source,
			Address:       req.Address,
			Dob:           pgtype.Date{Time: dob, Valid: true},
			ReferenceNo:   referenceNumber,
			SerialNo:      serialNo,
			FiscalYear:    settings.FiscalYear,
			StudentID:     userID,
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				message := "Already used for registration"

				switch pgErr.ConstraintName {
				case "students_email_key":
					message = "Email already used for registration"
				case "students_phone_key":
					message = "Phone number already used for registration"
				case "students_reference_no_key", "unique_serial_per_fiscal_year":
					message = "Please resubmit the form"
				}

				slog.Warn("student creation conflict",
					"constraint", pgErr.ConstraintName,
					"email", req.Email,
					"phone", req.Phone,
					"reference_no", referenceNumber,
					"path", c.FullPath(),
					"ip", c.ClientIP(),
				)

				c.JSON(http.StatusConflict, types.APIResponse{
					Success: false,
					Message: message,
					Code:    constants.StudentAlreadyExists,
				})
				return
			}

			slog.Error("failed to create student",
				"error", err,
				"reference_no", referenceNumber,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		for _, v := range req.Courses {
			courseID, err := utils.ConvertToUUID(v)
			if err != nil {
				slog.Warn("invalid course id",
					"course_id", v,
					"student_id", student.ID,
					"path", c.FullPath(),
					"ip", c.ClientIP(),
				)

				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid course ID",
					Code:    constants.InvalidIDFormat,
				})
				return
			}

			err = qtx.EnrollStudentInCourse(ctx, db.EnrollStudentInCourseParams{
				StudentID: student.ID,
				CourseID:  courseID,
			})

			if err != nil {

				// fk violation check
				var pgErr *pgconn.PgError
				if errors.As(err, &pgErr) && pgErr.Code == "23503" {
					slog.Warn("course not found",
						"course_id", courseID,
						"student_id", student.ID,
						"path", c.FullPath(),
						"ip", c.ClientIP(),
					)

					c.JSON(http.StatusBadRequest, types.APIResponse{
						Success: false,
						Message: "Course not found",
						Code:    constants.CourseNotFound,
					})
					return
				}

				slog.Error("failed to enroll student",
					"course_id", courseID,
					"student_id", student.ID,
					"error", err,
					"path", c.FullPath(),
					"ip", c.ClientIP(),
				)

				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
		}

		if err := tx.Commit(ctx); err != nil {
			slog.Error("transaction commit failed",
				"student_id", student.ID,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("student created successfully",
			"student_id", student.ID,
			"reference_no", referenceNumber,
			"courses_count", len(req.Courses),
			"path", c.FullPath(),
			"ip", c.ClientIP(),
		)

		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Admission form submitted",
		})
	}
}
