package suppliers

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/suprimkhatri77/sms/backend/internal/pkg/applog"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/types"
	"github.com/suprimkhatri77/sms/backend/internal/utils"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

const handlerUpdateSupplier = "UpdateSupplier"

type UpdateSupplierRequest struct {
	CompanyName string `json:"companyName" binding:"required,notblank,min=2,max=100"`
	Phone       string `json:"phone" binding:"omitempty,nepal_phone"`
	VatNo       string `json:"vatNo" binding:"omitempty,nepal_vat"`
}

func UpdateSupplier(queries accountingRepository.SuppliersRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		supplierIDFromParam := c.Param("supplierID")
		supplierID, err := utils.ConvertToUUID(supplierIDFromParam)
		if err != nil {
			applog.Warn(c, handlerUpdateSupplier, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid ID format",
				Code:    constants.InvalidIDFormat,
			})
			return
		}

		var req UpdateSupplierRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			applog.Warn(c, handlerUpdateSupplier, "invalid request",
				slog.Any(applog.AttrError, err))
			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Invalid request body",
				Code:    constants.ValidationFailed,
				Errors:  validator.Parse(err, req),
			})
			return
		}

		utils.TrimStruct(&req)

		_, err = queries.UpdateSupplier(ctx, db.UpdateSupplierParams{
			CompanyName: req.CompanyName,
			Phone:       utils.ToNullableText(req.Phone),
			VatNo:       utils.ToNullableText(req.VatNo),
			ID:          supplierID,
		})

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {

				switch pgErr.ConstraintName {

				case "suppliers_company_name_key":
					applog.Warn(c, handlerUpdateSupplier, "conflict",
						slog.Any(applog.AttrError, err))
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Company with that name already exists",
						Code:    constants.CompanyAlreadyExists,
					})
					return
				case "suppliers_vat_no_key":
					applog.Warn(c, handlerUpdateSupplier, "conflict")
					c.JSON(http.StatusConflict, types.APIResponse{
						Success: false,
						Message: "Vat no already exists",
						Code:    constants.VatNoAlreadyExists,
					})
					return
				default:
					applog.Error(c, handlerUpdateSupplier, "failed to process request",
						slog.Any(applog.AttrError, err),
					)
					c.JSON(http.StatusInternalServerError, types.APIResponse{
						Success: false,
						Message: "Failed to process request",
						Code:    constants.InternalServerError,
					})
					return
				}
			}
			applog.Error(c, handlerUpdateSupplier, "failed to process request",
				slog.Any(applog.AttrError, err),
			)
			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Failed to process request",
				Code:    constants.InternalServerError,
			})
			return
		}

		applog.Info(c, handlerUpdateSupplier, "supplier info updated")
		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Supplier info updated",
		})

	}
}
