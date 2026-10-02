-- name: CreateStockOut :one
-- clock_timestamp (not the column default NOW(), which is the same for every
-- row of a transaction) keeps the lines of one batch in order, so FIFO takes
-- them first to last.
INSERT INTO stock_out (product_id, date, bill_no, qty, rate, note, created_at)
VALUES ($1, $2, $3, $4, $5, $6, clock_timestamp())
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
    p.unit AS product_unit,
    cp.path AS category_path,
    COALESCE(sc.cost, 0)::BIGINT AS cost
FROM stock_out so
JOIN products p ON p.id = so.product_id
LEFT JOIN product_category_paths cp ON cp.category_id = p.category_id
-- cost in paisa of the purchase batches this sale used
LEFT JOIN LATERAL (
    SELECT SUM(ROUND((a.lot_offset + a.qty) * si.rate) - ROUND(a.lot_offset * si.rate)) AS cost
    FROM stock_allocations a
    JOIN stock_in si ON si.id = a.stock_in_id
    WHERE a.stock_out_id = so.id
) sc ON TRUE
WHERE
    (sqlc.narg('search')::TEXT IS NULL OR (
    p.name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
    OR so.bill_no ILIKE '%' || sqlc.narg('search')::TEXT || '%'))
    AND (sqlc.narg('from')::TEXT IS NULL OR so.date >= sqlc.narg('from')::TEXT)
    AND (sqlc.narg('to')::TEXT IS NULL OR so.date <= sqlc.narg('to')::TEXT)
ORDER BY
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'asc' THEN so.rate END ASC,
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'desc' THEN so.rate END DESC,
    so.created_at DESC
LIMIT sqlc.narg('limit')::INT OFFSET sqlc.arg('offset')::INT;


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

-- name: GetStockOutProductID :one
-- Read without a row lock: stock writes lock the product first (see
-- stockfifo.LockRow); locking this row first would invert that order.
SELECT product_id FROM stock_out
WHERE id = $1;

-- name: UpdateStockOut :one
UPDATE stock_out
SET product_id = $2, date = $3, bill_no = $4, qty = $5, rate = $6, note = $7
WHERE id = $1
RETURNING *;

-- name: DeleteStockOut :exec
DELETE FROM stock_out
WHERE id = $1;

-- name: GetStockOutCount :one
SELECT COUNT(*)
FROM stock_out so
JOIN products p ON p.id = so.product_id
WHERE
    (sqlc.narg('search')::TEXT IS NULL OR (
    p.name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
    OR so.bill_no ILIKE '%' || sqlc.narg('search')::TEXT || '%'))
    AND (sqlc.narg('from')::TEXT IS NULL OR so.date >= sqlc.narg('from')::TEXT)
    AND (sqlc.narg('to')::TEXT IS NULL OR so.date <= sqlc.narg('to')::TEXT);