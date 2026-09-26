package courses

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerCreateCourse = "CreateCourse"

func CreateCourse(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var req types.CreateCourse

		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerCreateCourse, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request data",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		slug := utils.Slugify(req.Name)

		course, err := queries.CreateCourse(ctx, db.CreateCourseParams{
			Name:     strings.ToLower(req.Name),
			IsActive: *req.IsActive,
			Fee:      int32(utils.RupeesToPaisa(req.Fee)),
			Slug:     slug,
		})

		if err != nil {

			// unique constraint error check
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {

				switch pgErr.ConstraintName {
				case "courses_slug_unique":
					applog.Warn(c, handlerCreateCourse, "conflict",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Course already exists",
						Code:    constants.CourseAlreadyExists,
					})

				default:

					applog.Warn(c, handlerCreateCourse, "conflict")
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Course with this name already exists",
						Code:    constants.CourseAlreadyExists,
					})
				}
				return
			}

			applog.Error(c, handlerCreateCourse, "failed to process request",

				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to create course",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerCreateCourse, "course created")
		c.JSON(http.StatusCreated, types.APIResponse{
			Success: true,
			Message: "Course created",
			Data:    course,
		})

	}
}
