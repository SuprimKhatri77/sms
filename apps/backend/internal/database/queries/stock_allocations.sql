-- name: LockProductsForStock :many
-- Serialises every stock change per product. Locking in id order keeps two
-- multi-product batches from deadlocking each other.
SELECT id, name, unit FROM products
WHERE id = ANY(sqlc.arg('ids')::UUID[])
ORDER BY id
FOR UPDATE;

-- name: ListStockLotsForProduct :many
SELECT id, date, created_at, qty FROM stock_in
WHERE product_id = $1
ORDER BY date, created_at, id;

-- name: ListStockConsumersForProduct :many
SELECT 'sale'::TEXT AS kind, id, date, created_at, qty, bill_no FROM stock_out
WHERE stock_out.product_id = sqlc.arg('product_id')
UNION ALL
SELECT 'wastage'::TEXT AS kind, id, date, created_at, qty, NULL::TEXT AS bill_no FROM wastage
WHERE wastage.product_id = sqlc.arg('product_id')
ORDER BY date, created_at, id;

-- name: DeleteStockAllocationsForProduct :exec
-- Matches on either side, so it also catches links left behind when a row
-- has just been moved to another product.
DELETE FROM stock_allocations a
WHERE a.stock_in_id IN (SELECT si.id FROM stock_in si WHERE si.product_id = $1)
   OR a.stock_out_id IN (SELECT so.id FROM stock_out so WHERE so.product_id = $1)
   OR a.wastage_id IN (SELECT w.id FROM wastage w WHERE w.product_id = $1);

-- name: InsertStockAllocations :copyfrom
INSERT INTO stock_allocations (stock_in_id, stock_out_id, wastage_id, qty, lot_offset)
VALUES ($1, $2, $3, $4, $5);
