package inquiries

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
)

func DeleteInquiry(queries repository.AdminRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		inquiryIDFromParams := c.Param("inquiryID")

		if inquiryIDFromParams == "" {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Missing inquiry ID",
				Code:    constants.MissingInquiryID,
			})
			return
		}

		inquiryID, err := utils.ConvertToUUID(inquiryIDFromParams)
		if err != nil {
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		result, err := queries.DeleteInquiry(ctx, inquiryID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: true,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		if result.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, types.APIResponse{
				Success: false,
				Message: "Inquiry not found",
				Code:    constants.InquiryNotFound,
			})
			return
		}

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Inquiry deleted",
		})

	}
}
