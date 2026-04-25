package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                int
	GinMode             string
	DatabaseURL         string
	JWTRefreshSecret    string
	JWTAccessSecret     string
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	BootstrapSecret     string
	FrontendUrl         string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	port := 5000
	if p := os.Getenv("PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			port = v
		}
	}

	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "debug"
	}

	dbURL := os.Getenv("DATABASE_URL")
	jwtRefreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	jwtAccessSecret := os.Getenv("JWT_ACCESS_SECRET")
	cloudinaryCloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	cloudinaryAPIKey := os.Getenv("CLOUDINARY_API_KEY")
	cloudinaryAPISecret := os.Getenv("CLOUDINARY_API_SECRET")
	bootstrapSecret := os.Getenv("BOOTSTRAP_SECRET")
	frontendUrl := os.Getenv("FRONTEND_URL")

	return &Config{
		Port:                port,
		GinMode:             ginMode,
		DatabaseURL:         dbURL,
		JWTRefreshSecret:    jwtRefreshSecret,
		JWTAccessSecret:     jwtAccessSecret,
		CloudinaryCloudName: cloudinaryCloudName,
		CloudinaryAPIKey:    cloudinaryAPIKey,
		CloudinaryAPISecret: cloudinaryAPISecret,
		BootstrapSecret:     bootstrapSecret,
		FrontendUrl:         frontendUrl,
	}, nil
}
