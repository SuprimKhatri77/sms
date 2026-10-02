package stockfifo

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

// Repo is the part of the inventory repository that stock rebuilding needs.
// InventoryTxRepository satisfies it; use it inside the write's transaction.
type Repo interface {
	LockProductsForStock(ctx context.Context, ids []pgtype.UUID) ([]db.LockProductsForStockRow, error)
	ListStockLotsForProduct(ctx context.Context, productID pgtype.UUID) ([]db.ListStockLotsForProductRow, error)
	ListStockConsumersForProduct(ctx context.Context, productID pgtype.UUID) ([]db.ListStockConsumersForProductRow, error)
	DeleteStockAllocationsForProduct(ctx context.Context, productID pgtype.UUID) error
	InsertStockAllocations(ctx context.Context, params []db.InsertStockAllocationsParams) (int64, error)
}

// ErrProductNotFound means one of the products to lock doesn't exist.
var ErrProductNotFound = errors.New("product not found")

// ErrConcurrentChange means another write moved the row to a different
// product while this one was waiting for the lock; retrying will work.
var ErrConcurrentChange = errors.New("row changed concurrently")

// ShortfallError means a write would leave a sale or wastage without enough
// stock on its date. Nothing should be committed when it's returned.
type ShortfallError struct {
	ProductName string
	ProductUnit string
	Shortfall   Shortfall
}

func (e *ShortfallError) Error() string {
	c := e.Shortfall.Consumer
	what := "the sale"
	if c.Kind == KindWastage {
		what = "the wastage"
	}
	what += " on " + c.Date
	if c.BillNo != "" {
		what += " (bill " + c.BillNo + ")"
	}
	return fmt.Sprintf("Not enough %q in stock for %s: needs %s %s, only %s available",
		e.ProductName, what,
		FormatQty(c.Qty), e.ProductUnit, FormatQty(e.Shortfall.Available))
}

// LineMessage is the short form shown next to the offending form line.
func (e *ShortfallError) LineMessage() string {
	return fmt.Sprintf("Only %s %s in stock on %s",
		FormatQty(e.Shortfall.Available), e.ProductUnit, e.Shortfall.Consumer.Date)
}

// Lock row-locks the given products until the transaction ends, so stock
// changes to the same product run one at a time. Duplicate IDs are fine.
// It returns ErrProductNotFound if any of them doesn't exist.
func Lock(ctx context.Context, repo Repo, ids ...pgtype.UUID) ([]db.LockProductsForStockRow, error) {
	unique := make([]pgtype.UUID, 0, len(ids))
	seen := make(map[[16]byte]bool, len(ids))
	for _, id := range ids {
		if !seen[id.Bytes] {
			seen[id.Bytes] = true
			unique = append(unique, id)
		}
	}

	products, err := repo.LockProductsForStock(ctx, unique)
	if err != nil {
		return nil, err
	}
	if len(products) != len(unique) {
		return nil, ErrProductNotFound
	}
	return products, nil
}

// LockRow locks the products a write to one existing purchase, sale or
// wastage row touches: the row's current product, plus extra (the product an
// update moves it to). getProduct reads the row's product_id.
//
// The product is locked before anything locks the row itself, the same order
// every other stock write uses (product, then rows), so they can't deadlock.
// The row is read again under the lock to catch a move that happened while
// waiting. A missing row returns pgx.ErrNoRows from getProduct.
func LockRow(
	ctx context.Context,
	repo Repo,
	getProduct func(context.Context, pgtype.UUID) (pgtype.UUID, error),
	rowID pgtype.UUID,
	extra ...pgtype.UUID,
) ([]db.LockProductsForStockRow, error) {
	productID, err := getProduct(ctx, rowID)
	if err != nil {
		return nil, err
	}
	products, err := Lock(ctx, repo, append([]pgtype.UUID{productID}, extra...)...)
	if err != nil {
		return nil, err
	}
	current, err := getProduct(ctx, rowID)
	if err != nil {
		return nil, err // deleted while waiting: pgx.ErrNoRows
	}
	if current != productID {
		return nil, ErrConcurrentChange
	}
	return products, nil
}

// Clear drops the batch links of the given products. Rebuild does this
// itself; call it first only when the write would otherwise be blocked by
// them, i.e. before deleting a purchase.
func Clear(ctx context.Context, repo Repo, products []db.LockProductsForStockRow) error {
	for _, product := range products {
		if err := repo.DeleteStockAllocationsForProduct(ctx, product.ID); err != nil {
			return fmt.Errorf("delete allocations: %w", err)
		}
	}
	return nil
}

// Rebuild recomputes the batch links of each product from its full history.
// Redoing it from scratch on every write means edits, deletes and backdated
// entries all reflow the same way. The products must already be locked.
func Rebuild(ctx context.Context, repo Repo, products []db.LockProductsForStockRow) error {
	for _, product := range products {
		if err := rebuildProduct(ctx, repo, product); err != nil {
			return err
		}
	}
	return nil
}

func rebuildProduct(ctx context.Context, repo Repo, product db.LockProductsForStockRow) error {
	lotRows, err := repo.ListStockLotsForProduct(ctx, product.ID)
	if err != nil {
		return fmt.Errorf("list lots: %w", err)
	}
	consumerRows, err := repo.ListStockConsumersForProduct(ctx, product.ID)
	if err != nil {
		return fmt.Errorf("list consumers: %w", err)
	}

	lots := make([]Lot, len(lotRows))
	for i, r := range lotRows {
		lots[i] = Lot{ID: r.ID, Date: r.Date, Qty: toThousandths(r.Qty)}
	}
	consumers := make([]Consumer, len(consumerRows))
	for i, r := range consumerRows {
		consumers[i] = Consumer{
			Kind:   r.Kind,
			ID:     r.ID,
			Date:   r.Date,
			BillNo: r.BillNo.String,
			Qty:    toThousandths(r.Qty),
		}
	}

	allocations, short := Allocate(lots, consumers)
	if short != nil {
		return &ShortfallError{
			ProductName: product.Name,
			ProductUnit: product.Unit,
			Shortfall:   *short,
		}
	}

	if err := repo.DeleteStockAllocationsForProduct(ctx, product.ID); err != nil {
		return fmt.Errorf("delete allocations: %w", err)
	}
	if len(allocations) == 0 {
		return nil
	}

	params := make([]db.InsertStockAllocationsParams, len(allocations))
	for i, a := range allocations {
		p := db.InsertStockAllocationsParams{
			StockInID: a.LotID,
			Qty:       fromThousandths(a.Qty),
			LotOffset: fromThousandths(a.Offset),
		}
		if a.Consumer.Kind == KindWastage {
			p.WastageID = a.Consumer.ID
		} else {
			p.StockOutID = a.Consumer.ID
		}
		params[i] = p
	}
	if _, err := repo.InsertStockAllocations(ctx, params); err != nil {
		return fmt.Errorf("insert allocations: %w", err)
	}
	return nil
}

// FormatQty renders thousandths as a plain quantity: 2500 -> "2.5".
func FormatQty(thousandths int64) string {
	return strconv.FormatFloat(fromThousandths(thousandths), 'f', -1, 64)
}

func toThousandths(qty float64) int64 {
	return int64(math.Round(qty * 1000))
}

func fromThousandths(q int64) float64 {
	return float64(q) / 1000
}
