package upload

import (
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/suprimkhatri77/sms/backend/internal/constants"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/cloudinary"
	"github.com/suprimkhatri77/sms/backend/internal/types"
)

func Upload(cld *cloudinary.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		file, header, err := c.Request.FormFile("image")
		if err != nil {
			slog.Warn("missing image file",
				"path", c.FullPath(),
				"ip", c.ClientIP(),
				"error", err,
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Image is required",
				Code:    constants.ImageIsRequired,
			})
			return
		}
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		size := header.Size

		allowed := map[string]bool{
			".jpg":  true,
			".jpeg": true,
			".png":  true,
			".webp": true,
		}

		if !allowed[ext] {
			slog.Warn("invalid image format",
				"filename", header.Filename,
				"ext", ext,
				"size_bytes", size,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Only jpg, jpeg, png, webp allowed",
				Code:    constants.InvalidImageFormat,
			})
			return
		}

		if size > 2<<20 {
			slog.Warn("image too large",
				"filename", header.Filename,
				"size_bytes", size,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusBadRequest, types.APIResponse{
				Success: false,
				Message: "Image must be under 2MB",
				Code:    constants.InvalidImageSize,
			})
			return
		}

		folder := c.DefaultQuery("folder", "sms/misc")

		url, publicID, err := cld.UploadImage(ctx, file, folder)
		if err != nil {
			slog.Error("cloudinary upload failed",
				"filename", header.Filename,
				"size_bytes", size,
				"folder", folder,
				"error", err,
				"path", c.FullPath(),
				"ip", c.ClientIP(),
			)

			c.JSON(http.StatusInternalServerError, types.APIResponse{
				Success: false,
				Message: "Upload failed",
				Code:    constants.InternalServerError,
			})
			return
		}

		slog.Info("image uploaded successfully",
			"filename", header.Filename,
			"size_bytes", size,
			"folder", folder,
			"public_id", publicID,
			"path", c.FullPath(),
			"ip", c.ClientIP(),
		)

		c.JSON(http.StatusOK, types.APIResponse{
			Success: true,
			Message: "Image uploaded successfully",
			Data: gin.H{
				"imageUrl":      url,
				"imagePublicID": publicID,
			},
		})
	}
}
