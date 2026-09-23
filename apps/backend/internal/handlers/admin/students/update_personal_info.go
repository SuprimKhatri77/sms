package students

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

type updateStudentPersonalInfo struct {
	FullName  string `json:"fullName" binding:"required,notblank,min=2,max=70,alphaspace"`
	DobAD     string `json:"dobAd" binding:"required,notblank,date_format"`
	DobBS     string `json:"dobBs" binding:"required,notblank,bs_date"`
	Phone     string `json:"phone" binding:"required,notblank,nepal_phone"`
	Address   string `json:"address" binding:"required,notblank,max=70"`
	Source    string `json:"source" binding:"required,oneof=facebook instagram tiktok referral inperson"`
	Gender    string `json:"gender" binding:"required,oneof=male female other"`
	Shift     string `json:"shift" binding:"required,oneof=morning day evening"`
	ShiftTime string `json:"shiftTime" binding:"required,notblank"`
	Batch     string `json:"batch" binding:"omitempty,notblank,min=2,max=100"`
}

func UpdateStudentPersonalInfo(queries repository.AdminRepository) gin.HandlerFunc {
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

		var req updateStudentPersonalInfo
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request body",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		dob, err := time.Parse("2006-01-02", req.DobAD)
		if err != nil {
			slog.Warn("invalid dob format",
				"dob", req.DobAD,
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

		if err := utils.ValidateBSMatchesAD(req.DobBS, dob); err != nil {
			slog.Warn("bs/ad dob mismatch",
				"dobBs", req.DobBS,
				"dobAd", req.DobAD,
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

		result, err := queries.UpdateStudentPersonalInfo(ctx, db.UpdateStudentPersonalInfoParams{
			FullName:  req.FullName,
			Batch:     utils.ToNullableText(req.Batch),
			Shift:     req.Shift,
			ShiftTime: req.ShiftTime,
			Phone:     req.Phone,
			Address:   req.Address,
			Source:    req.Source,
			Gender:    req.Gender,
			DobAd:     pgtype.Date{Time: dob, Valid: true},
			DobBs:     req.DobBS,
			ID:        studentID,
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to update student info",
				Code:    constants.InternalServerError,
			})
			return
		}

		if result.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Student not found",
				Code:    constants.StudentNotFound,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Student info updated",
		})

	}

}
