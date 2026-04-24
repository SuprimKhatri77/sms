package payments

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
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
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing student ID",
				Code:    constants.MissingStudentID,
			})
			return
		}

		studentID, err := utils.ConvertToUUID(studentIDFromParams)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req types.AddPaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		// it is the admin ID , who added the payment
		addedBy, err := utils.ConvertToUUID(req.AddedBy)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		_, err = queries.AddPayment(ctx, db.AddPaymentParams{
			StudentID: studentID,
			Amount:    int32(req.Amount),
			Remarks:   pgtype.Text{String: req.Remarks, Valid: true},
			AddedBy:   addedBy,
		})

		if err != nil {
			var pgErr *pgconn.PgError

			// catching the fk violation
			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
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
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Payment added",
		})

	}

}
