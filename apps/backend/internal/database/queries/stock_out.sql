-- name: CreateStockOut :one
INSERT INTO stock_out (product_id, date, bill_no, qty, rate, note)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetStockOutByID :one
SELECT
    so.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_out so
JOIN products p ON p.id = so.product_id
WHERE so.id = $1;

-- name: ListStockOut :many
SELECT
    so.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_out so
JOIN products p ON p.id = so.product_id
ORDER BY so.created_at DESC;

-- name: ListStockOutByProduct :many
SELECT
    so.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_out so
JOIN products p ON p.id = so.product_id
WHERE so.product_id = $1
ORDER BY so.created_at DESC;

-- name: ListStockOutByBillNo :many
-- useful for tracing which items went out under a specific physical bill
SELECT
    so.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_out so
JOIN products p ON p.id = so.product_id
WHERE so.bill_no = $1
ORDER BY so.created_at ASC;

-- name: ListStockOutByDateRange :many
SELECT
    so.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_out so
JOIN products p ON p.id = so.product_id
WHERE so.date >= $1 AND so.date <= $2
ORDER BY so.date ASC;

-- name: UpdateStockOut :one
UPDATE stock_out
SET product_id = $2, date = $3, bill_no = $4, qty = $5, rate = $6, note = $7
WHERE id = $1
RETURNING *;

-- name: DeleteStockOut :exec
DELETE FROM stock_out
WHERE id = $1;