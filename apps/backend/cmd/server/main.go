package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"

	appconfig "github.com/suprimkhatri77/sms/backend/internal/config"
	"github.com/suprimkhatri77/sms/backend/internal/database"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"

	dbgen "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/middleware"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/cloudinary"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	"github.com/suprimkhatri77/sms/backend/internal/routes"
	routeconfig "github.com/suprimkhatri77/sms/backend/internal/routes/config"
	"github.com/suprimkhatri77/sms/backend/internal/validator"
)

func main() {
	cfg, err := appconfig.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	gin.SetMode(cfg.GinMode)

	if cfg.DatabaseURL == "" {
		log.Fatal("config: DATABASE_URL is required (set it in .env or environment)")
	}

	cldClient, err := cloudinary.New(
		cfg.CloudinaryCloudName,
		cfg.CloudinaryAPIKey,
		cfg.CloudinaryAPISecret,
	)

	if err != nil {
		log.Fatalf("cloudinary: %v", err)
	}

	ctx := context.Background()
	db, err := database.ConnectWithRetry(ctx, cfg.DatabaseURL, 10)
	if err != nil {
		slog.Error("error", "err", err)
		os.Exit(1)
	}

	defer db.Close()
	queries := dbgen.New(db.Pool)

	validator.Init()

	var handler slog.Handler
	if os.Getenv("GO_ENV") == "production" {
		handler = slog.NewJSONHandler(os.Stdout, nil)
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level:     slog.LevelDebug,
			AddSource: true,
		})
	}
	logger := slog.New(handler)
	slog.SetDefault(logger)

	r := gin.New()
	r.Use(middleware.Recovery())
	r.Use(gin.Logger())
	r.Use(middleware.CORS(cfg))

	routes.Setup(r, routeconfig.Config{
		Config:      cfg,
		Queries:     queries,
		CldClient:   cldClient,
		StudentRepo: repository.NewAdmissionRepository(queries),
		LedgerRepo:  accountingRepository.NewLedgerTxRepository(queries, db.Pool),
		PgxPool:     db.Pool,
	})

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Port),
		Handler: r,
	}

	go func() {
		slog.Info("server listening", slog.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server listen failed", slog.Any("error", err))
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	slog.Info("shutting down server")
	if err := srv.Shutdown(context.Background()); err != nil {
		slog.Error("server shutdown failed", slog.Any("error", err))
	}
	slog.Info("server stopped")
}
