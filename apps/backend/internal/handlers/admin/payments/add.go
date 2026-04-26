package payments

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

func AddPayment(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		studentIDFromParams := c.Param("studentID")
		if studentIDFromParams == "" {
			slog.Warn("missing student id",
				slog.String("handler", "AddPayment"),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing student ID",
				Code:    constants.MissingStudentID,
			})
			return
		}

		studentID, err := utils.ConvertToUUID(studentIDFromParams)
		if err != nil {
			slog.Warn("invalid student id format",
				slog.String("handler", "AddPayment"),
				slog.String("student_id_raw", studentIDFromParams),
				slog.Any("error", err),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.AddPaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			slog.Warn("invalid request body",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
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

		addedBy, err := utils.ConvertToUUID(req.AddedBy)
		if err != nil {
			slog.Warn("invalid added_by id",
				slog.String("handler", "AddPayment"),
				slog.String("added_by_raw", req.AddedBy),
				slog.Any("error", err),
			)
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		student, err := queries.GetStudentByID(ctx, studentID)

		if err != nil {
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
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if student.Status != "accepted" && student.Status != "completed" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Cannot add payment for a student with pending or rejected status",
				Code:    constants.InvalidStudentStatus,
			})
			return
		}

		amount := int32(req.Amount * 100)

		slog.Info("adding payment",
			slog.String("handler", "AddPayment"),
			slog.String("student_id", studentIDFromParams),
			slog.String("added_by", req.AddedBy),
			slog.Int("amount", int(amount)),
		)

		_, err = queries.AddPayment(ctx, db.AddPaymentParams{
			StudentID: studentID,
			Amount:    amount,
			Remarks:   pgtype.Text{String: req.Remarks, Valid: true},
			AddedBy:   addedBy,
		})

		if err != nil {
			var pgErr *pgconn.PgError

			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				slog.Warn("foreign key violation",
					slog.String("handler", "AddPayment"),
					slog.String("constraint", pgErr.ConstraintName),
					slog.String("student_id", studentIDFromParams),
					slog.String("added_by", req.AddedBy),
				)

				switch pgErr.ConstraintName {
				case "payments_student_id_fkey":
					c.JSON(http.StatusNotFound, types.APIResponse{
						Success: false,
						Message: "Student not found",
						Code:    constants.StudentNotFound,
					})
				case "payments_added_by_fkey":
					c.JSON(http.StatusNotFound, types.APIResponse{
						Success: false,
						Message: "Admin not found",
						Code:    constants.UserNotFound,
					})
				}
				return
			}

			slog.Error("failed to add payment",
				slog.String("handler", "AddPayment"),
				slog.Any("error", err),
				slog.String("student_id", studentIDFromParams),
				slog.String("added_by", req.AddedBy),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("payment added successfully",
			slog.String("handler", "AddPayment"),
			slog.String("student_id", studentIDFromParams),
			slog.String("added_by", req.AddedBy),
			slog.Int("amount", int(amount)),
		)

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Payment added",
		})
	}
}
