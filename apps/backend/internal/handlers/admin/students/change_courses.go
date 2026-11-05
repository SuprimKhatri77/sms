package students

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerChangeStudentCourses = "ChangeStudentCourses"

type ChangeStudentCoursesRequest struct {
	CourseIDs []string `json:"courseIds" binding:"required,min=1,dive,uuid"`
}

// diffCourseIDs returns which courses to enroll in and which to drop to turn
// current into requested. Duplicates in requested are ignored.
func diffCourseIDs(current, requested []pgtype.UUID) (toAdd, toRemove []pgtype.UUID) {
	currentSet := make(map[pgtype.UUID]struct{}, len(current))
	for _, id := range current {
		currentSet[id] = struct{}{}
	}

	requestedSet := make(map[pgtype.UUID]struct{}, len(requested))
	for _, id := range requested {
		if _, seen := requestedSet[id]; seen {
			continue
		}
		requestedSet[id] = struct{}{}
		if _, enrolled := currentSet[id]; !enrolled {
			toAdd = append(toAdd, id)
		}
	}

	for _, id := range current {
		if _, keep := requestedSet[id]; !keep {
			toRemove = append(toRemove, id)
		}
	}

	return toAdd, toRemove
}

// courseChangeBlockedMessage explains why a student's records rule out a
// course change, or returns "" when there are none.
func courseChangeBlockedMessage(blockers db.GetStudentCourseChangeBlockersRow) string {
	switch {
	case blockers.PaymentCount > 0:
		return "Course can't be changed because this student already has payments"
	case blockers.DiscountCount > 0:
		return "Course can't be changed because this student already has a discount"
	case blockers.ScholarshipCount > 0:
		return "Course can't be changed because this student already has a scholarship"
	case blockers.CertificateCount > 0:
		return "Course can't be changed because this student already has a certificate"
	}
	return ""
}

func ChangeStudentCourses(queries repository.AdminStudentCoursesTxRepository, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		studentIDFromParams := c.Param("studentID")
		studentID, err := utils.ConvertToUUID(studentIDFromParams)
		if err != nil {
			applog.Warn(c, handlerChangeStudentCourses, "invalid request",
				applog.WithStudentID(studentIDFromParams),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req ChangeStudentCoursesRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerChangeStudentCourses, "invalid request",
				applog.WithStudentID(studentIDFromParams),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Please select at least one valid course",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		requested := make([]pgtype.UUID, 0, len(req.CourseIDs))
		for _, v := range req.CourseIDs {
			courseID, err := utils.ConvertToUUID(v)
			if err != nil {
				applog.Warn(c, handlerChangeStudentCourses, "invalid course id",
					slog.String("course_id", v),
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "Invalid course ID",
					Code:    constants.InvalidIDFormat,
				})
				return
			}
			requested = append(requested, courseID)
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			applog.Error(c, handlerChangeStudentCourses, "failed to begin transaction",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}
		defer tx.Rollback(ctx)

		qtx := queries.WithTx(tx)

		// Everything below reads after this lock, so a payment, discount,
		// scholarship, certificate or status change can't slip past the checks.
		status, err := qtx.LockStudentForUpdate(ctx, studentID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				applog.Warn(c, handlerChangeStudentCourses, "resource not found",
					applog.WithStudentID(studentIDFromParams))
				c.JSON(http.StatusNotFound, types.APIResponse{
					Success: false,
					Message: "Student not found",
					Code:    constants.StudentNotFound,
				})
				return
			}
			applog.Error(c, handlerChangeStudentCourses, "failed to lock student",
				applog.WithStudentID(studentIDFromParams),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if status != "pending" && status != "active" {
			applog.Warn(c, handlerChangeStudentCourses, "course change refused",
				applog.WithStudentID(studentIDFromParams),
				slog.String(applog.AttrStudentStatus, status))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: "Course can only be changed for a pending or active student",
				Code:    constants.CourseChangeNotAllowed,
			})
			return
		}

		blockers, err := qtx.GetStudentCourseChangeBlockers(ctx, studentID)
		if err != nil {
			applog.Error(c, handlerChangeStudentCourses, "failed to check student records",
				applog.WithStudentID(studentIDFromParams),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if message := courseChangeBlockedMessage(blockers); message != "" {
			applog.Warn(c, handlerChangeStudentCourses, "course change refused",
				applog.WithStudentID(studentIDFromParams),
				slog.String("reason", message))
			c.JSON(http.StatusConflict, types.APIResponse{
				Success: false,
				Message: message,
				Code:    constants.CourseChangeNotAllowed,
			})
			return
		}

		enrolled, err := qtx.GetCoursesByStudentID(ctx, studentID)
		if err != nil {
			applog.Error(c, handlerChangeStudentCourses, "failed to fetch enrolled courses",
				applog.WithStudentID(studentIDFromParams),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		current := make([]pgtype.UUID, 0, len(enrolled))
		oldCourseNames := make([]string, 0, len(enrolled))
		for _, course := range enrolled {
			current = append(current, course.ID)
			oldCourseNames = append(oldCourseNames, course.Name)
		}

		toAdd, toRemove := diffCourseIDs(current, requested)
		if len(toAdd) == 0 && len(toRemove) == 0 {
			c.JSON(http.StatusOK, types.APIResponse{
				Success: true,
				Message: "No changes to save",
			})
			return
		}

		// Only newly added courses are checked: a kept course may have gone
		// inactive since the student enrolled, and that shouldn't block them.
		feeMap := make(map[pgtype.UUID]int64, len(toAdd))
		if len(toAdd) > 0 {
			addedCourses, err := qtx.GetCoursesByIDs(ctx, toAdd)
			if err != nil {
				applog.Error(c, handlerChangeStudentCourses, "failed to fetch course fees",
					applog.WithStudentID(studentIDFromParams),
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}

			if len(addedCourses) != len(toAdd) {
				applog.Warn(c, handlerChangeStudentCourses, "one or more courses not found",
					applog.WithStudentID(studentIDFromParams),
					slog.Int("requested", len(toAdd)),
					slog.Int("found", len(addedCourses)))
				c.JSON(http.StatusBadRequest, types.APIResponse{
					Success: false,
					Message: "One or more courses not found",
					Code:    constants.CourseNotFound,
				})
				return
			}

			for _, course := range addedCourses {
				if !course.IsActive {
					applog.Warn(c, handlerChangeStudentCourses, "inactive course selected",
						applog.WithStudentID(studentIDFromParams))
					c.JSON(http.StatusBadRequest, types.APIResponse{
						Success: false,
						Message: "One or more selected courses are no longer active",
						Code:    constants.CourseInactive,
					})
					return
				}
				feeMap[course.ID] = int64(course.Fee)
			}
		}

		for _, courseID := range toRemove {
			err := qtx.RemoveStudentFromCourse(ctx, db.RemoveStudentFromCourseParams{
				StudentID: studentID,
				CourseID:  courseID,
			})
			if err != nil {
				applog.Error(c, handlerChangeStudentCourses, "failed to remove course",
					applog.WithStudentID(studentIDFromParams),
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
		}

		for _, courseID := range toAdd {
			err := qtx.EnrollStudentInCourse(ctx, db.EnrollStudentInCourseParams{
				StudentID:       studentID,
				CourseID:        courseID,
				FeeAtEnrollment: feeMap[courseID],
			})
			if err != nil {
				var pgErr *pgconn.PgError
				if errors.As(err, &pgErr) && pgErr.Code == "23503" {
					applog.Warn(c, handlerChangeStudentCourses, "course not found during enrollment",
						applog.WithStudentID(studentIDFromParams),
						slog.String("constraint", pgErr.ConstraintName))
					c.JSON(http.StatusBadRequest, types.APIResponse{
						Success: false,
						Message: "Course not found",
						Code:    constants.CourseNotFound,
					})
					return
				}
				applog.Error(c, handlerChangeStudentCourses, "failed to enroll student",
					applog.WithStudentID(studentIDFromParams),
					slog.Any(applog.AttrError, err))
				c.JSON(http.StatusInternalServerError, types.APIResponse{
					Success: false,
					Message: "Failed to process request",
					Code:    constants.InternalServerError,
				})
				return
			}
		}

		if err := tx.Commit(ctx); err != nil {
			applog.Error(c, handlerChangeStudentCourses, "transaction commit failed",
				applog.WithStudentID(studentIDFromParams),
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		// applog.Base already records the admin as user_id.
		applog.Info(c, handlerChangeStudentCourses, "student courses changed",
			applog.WithStudentID(studentIDFromParams),
			slog.Any("old_courses", oldCourseNames),
			slog.Any("new_course_ids", req.CourseIDs))

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Courses updated",
		})
	}
}
