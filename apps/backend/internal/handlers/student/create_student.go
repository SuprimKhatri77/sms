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

type DataResponse struct {
	ReferenceNo string `json:"referenceNo"`
	FiscalYear  string `json:"fiscalYear"`
	CreatedAt   string `json:"createdAt"`
}

func CreateStudent(queries repository.StudentRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		userIDFromContext := c.MustGet("userID").(string)
		role := c.MustGet("role").(string)
		if role != "student" {
			c.JSON(http.StatusForbidden, types.APIResponse{
				Success: false,
				Message: "Only students are permitted to submit the admission form",
				Code:    constants.Forbidden,
			})
			return
		}
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

		dobAD, err := time.Parse("2006-01-02", req.DobAD)
		if err != nil {
			slog.Warn("invalid dob format",
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

		if err := utils.ValidateBSMatchesAD(req.DobBS, dobAD); err != nil {
			slog.Warn("bs/ad dob mismatch",
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "BS date and AD date do not match",
				Code:    constants.ValidationFailed,
			})
			return
		}

		courseUUIDs := make([]pgtype.UUID, 0, len(req.Courses))
		for _, v := range req.Courses {
			courseID, err := utils.ConvertToUUID(v)
			if err != nil {
				slog.Warn("invalid course id",
					"course_id", v,
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
			courseUUIDs = append(courseUUIDs, courseID)
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
			Phone:         req.Phone,
			PhotoUrl:      pgtype.Text{String: req.PhotoUrl, Valid: true},
			Source:        req.Source,
			Address:       req.Address,
			DobAd:         pgtype.Date{Time: dobAD, Valid: true},
			DobBs:         req.DobBS,
			ReferenceNo:   referenceNumber,
			SerialNo:      serialNo,
			FiscalYear:    settings.FiscalYear,
			StudentID:     userID,
			Shift:         req.Shift,
			ShiftTime:     req.ShiftTime,
			Batch:         pgtype.Text{Valid: false},
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

		// update th user image
		if role == "student" {

			err = qtx.UpdateUserImage(ctx, db.UpdateUserImageParams{
				ImageUrl: pgtype.Text{String: req.PhotoUrl, Valid: true},
				ID:       userID,
			})

			if err != nil {
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
		}

		// fetch all course fees in one query
		courseFees, err := qtx.GetCoursesByIDs(ctx, courseUUIDs)
		if err != nil {
			slog.Error("failed to fetch course fees",
				"error", err,
				"student_id", student.ID,
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

		// validate all requested courses exist
		if len(courseFees) != len(courseUUIDs) {
			slog.Warn("one or more courses not found",
				"requested", len(courseUUIDs),
				"found", len(courseFees),
				"student_id", student.ID,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "One or more courses not found",
				Code:    constants.CourseNotFound,
			})
			return
		}

		feeMap := make(map[pgtype.UUID]int64, len(courseFees))
		for _, course := range courseFees {
			feeMap[course.ID] = int64(course.Fee)
		}

		for _, courseID := range courseUUIDs {
			err = qtx.EnrollStudentInCourse(ctx, db.EnrollStudentInCourseParams{
				StudentID:       student.ID,
				CourseID:        courseID,
				FeeAtEnrollment: feeMap[courseID],
			})
			if err != nil {
				var pgErr *pgconn.PgError
				if errors.As(err, &pgErr) && pgErr.Code == "23503" {
					slog.Warn("course not found during enrollment",
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
			Data: DataResponse{
				ReferenceNo: student.ReferenceNo,
				FiscalYear:  student.FiscalYear,
				CreatedAt:   student.CreatedAt.Time.String(),
			},
		})
	}
}
