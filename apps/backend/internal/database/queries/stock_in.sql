-- name: CreateStockIn :one
-- clock_timestamp (not the column default NOW(), which is the same for every
-- row of a transaction) keeps the lines of one batch in order, so FIFO takes
-- them first to last.
INSERT INTO stock_in (product_id, supplier_id, date, invoice_no, qty, rate, note, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, clock_timestamp())
RETURNING *;

-- name: GetStockInByID :one
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit,
    s.company_name AS supplier_name
FROM stock_in si
JOIN products p ON p.id = si.product_id
JOIN suppliers s ON s.id = si.supplier_id
WHERE si.id = $1;

-- name: ListStockIn :many
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit,
    cp.path AS category_path,
    s.company_name AS supplier_name,
    -- what's left of this batch after the sales and wastage that used it
    (si.qty - COALESCE((
        SELECT SUM(a.qty) FROM stock_allocations a WHERE a.stock_in_id = si.id
    ), 0))::FLOAT8 AS remaining_qty
FROM stock_in si
JOIN products p ON p.id = si.product_id
JOIN suppliers s ON s.id = si.supplier_id
LEFT JOIN product_category_paths cp ON cp.category_id = p.category_id
WHERE
    (sqlc.narg('search')::TEXT IS NULL OR (
        p.name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.company_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR si.invoice_no ILIKE '%' || sqlc.narg('search')::TEXT || '%'
    ))
    AND (sqlc.narg('from')::TEXT IS NULL OR si.date >= sqlc.narg('from')::TEXT)
    AND (sqlc.narg('to')::TEXT IS NULL OR si.date <= sqlc.narg('to')::TEXT)
ORDER BY
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'asc' THEN si.rate END ASC,
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'desc' THEN si.rate END DESC,
    si.created_at DESC
LIMIT sqlc.narg('limit')::INT OFFSET sqlc.arg('offset')::INT;

-- name: ListStockInByProduct :many
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit,
    s.company_name AS supplier_name
FROM stock_in si
JOIN products p ON p.id = si.product_id
JOIN suppliers s ON s.id = si.supplier_id
WHERE si.product_id = $1
ORDER BY si.created_at DESC;

-- name: ListStockInBySupplier :many
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit,
    s.company_name AS supplier_name
FROM stock_in si
JOIN products p ON p.id = si.product_id
JOIN suppliers s ON s.id = si.supplier_id
WHERE si.supplier_id = $1
ORDER BY si.created_at DESC;

-- name: ListStockInByDateRange :many
SELECT
    si.*,
    p.name AS product_name,
    p.unit AS product_unit,
    s.company_name AS supplier_name
FROM stock_in si
JOIN products p ON p.id = si.product_id
JOIN suppliers s ON s.id = si.supplier_id
WHERE si.date >= $1 AND si.date <= $2
ORDER BY si.date ASC;

-- name: GetStockInProductID :one
-- Read without a row lock: stock writes lock the product first (see
-- stockfifo.LockRow); locking this row first would invert that order.
SELECT product_id FROM stock_in
WHERE id = $1;

-- name: UpdateStockIn :one
UPDATE stock_in
SET product_id = $2, supplier_id = $3, date = $4, invoice_no = $5, qty = $6, rate = $7, note = $8
WHERE id = $1
RETURNING *;

-- name: DeleteStockIn :exec
DELETE FROM stock_in
WHERE id = $1;

-- name: GetStockInCount :one
SELECT COUNT(*)
FROM stock_in si
JOIN products p ON p.id = si.product_id
JOIN suppliers s ON s.id = si.supplier_id
WHERE
    (sqlc.narg('search')::TEXT IS NULL OR (
        p.name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.company_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR si.invoice_no ILIKE '%' || sqlc.narg('search')::TEXT || '%'
    ))
    AND (sqlc.narg('from')::TEXT IS NULL OR si.date >= sqlc.narg('from')::TEXT)
    AND (sqlc.narg('to')::TEXT IS NULL OR si.date <= sqlc.narg('to')::TEXT);