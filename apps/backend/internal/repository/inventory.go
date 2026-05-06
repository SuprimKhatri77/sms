package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type InventoryRepository interface {
	// for admin/inventory/products
	CreateProduct(ctx context.Context, params db.CreateProductParams) (db.Product, error)
	UpdateProduct(ctx context.Context, params db.UpdateProductParams) (db.Product, error)
	DeleteProduct(ctx context.Context, id pgtype.UUID) error
	ListProducts(ctx context.Context) ([]db.Product, error)

	// for admin/inventory/stock/in
	CreateStockIn(ctx context.Context, params db.CreateStockInParams) (db.StockIn, error)
	UpdateStockIn(ctx context.Context, params db.UpdateStockInParams) (db.StockIn, error)
	DeleteStockIn(ctx context.Context, id pgtype.UUID) error
	ListStockIn(ctx context.Context) ([]db.ListStockInRow, error)

	// for admin/inventory/stock/out
	CreateStockOut(ctx context.Context, params db.CreateStockOutParams) (db.StockOut, error)
	UpdateStockOut(ctx context.Context, params db.UpdateStockOutParams) (db.StockOut, error)
	DeleteStockOut(ctx context.Context, id pgtype.UUID) error
	ListStockOut(ctx context.Context) ([]db.ListStockOutRow, error)

	// for admin/inventory/summary
	GetInventorySummary(ctx context.Context) ([]db.GetInventorySummaryRow, error)

	// for admin/inventory/stock/wastage
	CreateWastage(ctx context.Context, params db.CreateWastageParams) (db.Wastage, error)
}
