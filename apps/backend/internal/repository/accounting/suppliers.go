package accountingRepository

import (
	"context"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type SuppliersRepository interface {
	CreateSupplier(ctx context.Context, params db.CreateSupplierParams) (db.Supplier, error)
	UpdateSupplier(ctx context.Context, params db.UpdateSupplierParams) (db.Supplier, error)
	DeleteSupplier(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
	ListSuppliers(ctx context.Context, params db.ListSuppliersParams) ([]db.Supplier, error)
	GetSupplierCount(ctx context.Context) (int64, error)
	GetSupplierCountFiltered(ctx context.Context, name pgtype.Text) (int64, error)
}
