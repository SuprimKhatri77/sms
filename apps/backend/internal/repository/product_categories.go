package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type ProductCategoryRepository interface {
	ListProductCategories(ctx context.Context) ([]db.ListProductCategoriesRow, error)
	CreateProductCategory(ctx context.Context, params db.CreateProductCategoryParams) (db.ProductCategory, error)
	DeleteProductCategory(ctx context.Context, id pgtype.UUID) (pgconn.CommandTag, error)
}

type ProductCategoryTxRepository interface {
	WithTx(tx pgx.Tx) ProductCategoryTxRepository
	LockProductCategoryTree(ctx context.Context) error
	IsProductCategoryInSubtree(ctx context.Context, params db.IsProductCategoryInSubtreeParams) (bool, error)
	UpdateProductCategory(ctx context.Context, params db.UpdateProductCategoryParams) (db.ProductCategory, error)
}

type productCategoryTxRepository struct {
	queries *db.Queries
}

func NewProductCategoryTxRepository(queries *db.Queries) ProductCategoryTxRepository {
	return &productCategoryTxRepository{queries: queries}
}

func (r *productCategoryTxRepository) WithTx(tx pgx.Tx) ProductCategoryTxRepository {
	return &productCategoryTxRepository{queries: r.queries.WithTx(tx)}
}

func (r *productCategoryTxRepository) LockProductCategoryTree(ctx context.Context) error {
	return r.queries.LockProductCategoryTree(ctx)
}

func (r *productCategoryTxRepository) IsProductCategoryInSubtree(ctx context.Context, params db.IsProductCategoryInSubtreeParams) (bool, error) {
	return r.queries.IsProductCategoryInSubtree(ctx, params)
}

func (r *productCategoryTxRepository) UpdateProductCategory(ctx context.Context, params db.UpdateProductCategoryParams) (db.ProductCategory, error) {
	return r.queries.UpdateProductCategory(ctx, params)
}
