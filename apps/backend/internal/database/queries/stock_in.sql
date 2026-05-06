-- name: CreateStockIn :one
INSERT INTO stock_in (product_id, date, invoice_no, qty, rate, note)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetStockInByID :one
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_in si
JOIN products p ON p.id = si.product_id
WHERE si.id = $1;

-- name: ListStockIn :many
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_in si
JOIN products p ON p.id = si.product_id
ORDER BY si.created_at DESC;

-- name: ListStockInByProduct :many
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_in si
JOIN products p ON p.id = si.product_id
WHERE si.product_id = $1
ORDER BY si.created_at DESC;

-- name: ListStockInByDateRange :many
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM stock_in si
JOIN products p ON p.id = si.product_id
WHERE si.date >= $1 AND si.date <= $2
ORDER BY si.date ASC;

-- name: UpdateStockIn :one
UPDATE stock_in
SET product_id = $2, date = $3, invoice_no = $4, qty = $5, rate = $6, note = $7
WHERE id = $1
RETURNING *;

-- name: DeleteStockIn :exec
DELETE FROM stock_in
WHERE id = $1;