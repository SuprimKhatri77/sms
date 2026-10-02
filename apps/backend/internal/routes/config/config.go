package config

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/suprimkhatri77/sms/backend/internal/config"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
	"github.com/suprimkhatri77/sms/backend/internal/pkg/cloudinary"
	"github.com/suprimkhatri77/sms/backend/internal/repository"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
)

type Config struct {
	Config      *config.Config
	Queries     *db.Queries
	CldClient   *cloudinary.Client
	StudentRepo repository.StudentRepository
	LedgerRepo  accountingRepository.LedgerTxRepository
	PgxPool     *pgxpool.Pool
}
