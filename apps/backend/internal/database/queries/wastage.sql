-- name: CreateWastage :one
-- clock_timestamp (not the column default NOW(), which is the same for every
-- row of a transaction) keeps the lines of one batch in order, so FIFO takes
-- them first to last.
INSERT INTO wastage (product_id, date, qty, reason, created_at)
VALUES ($1, $2, $3, $4, clock_timestamp())
RETURNING *;

-- name: GetWastageByID :one
SELECT
    w.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM wastage w
JOIN products p ON p.id = w.product_id
WHERE w.id = $1;

-- name: ListWastage :many
SELECT
    w.*,
    p.name AS product_name,
    p.unit AS product_unit,
    cp.path AS category_path,
    COALESCE(wc.cost, 0)::BIGINT AS cost
FROM wastage w
JOIN products p ON p.id = w.product_id
LEFT JOIN product_category_paths cp ON cp.category_id = p.category_id
-- cost in paisa of the purchase batches this wastage used
LEFT JOIN LATERAL (
    SELECT SUM(ROUND((a.lot_offset + a.qty) * si.rate) - ROUND(a.lot_offset * si.rate)) AS cost
    FROM stock_allocations a
    JOIN stock_in si ON si.id = a.stock_in_id
    WHERE a.wastage_id = w.id
) wc ON TRUE
WHERE
    (sqlc.narg('product_name')::TEXT IS NULL OR p.name ILIKE '%' || sqlc.narg('product_name')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR w.date >= sqlc.narg('from')::TEXT)
    AND (sqlc.narg('to')::TEXT IS NULL OR w.date <= sqlc.narg('to')::TEXT)
-- wastage has no rate of its own; the price sort orders by cost
ORDER BY
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'asc' THEN wc.cost END ASC,
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'desc' THEN wc.cost END DESC,
    w.created_at DESC
LIMIT sqlc.narg('limit')::INT OFFSET sqlc.arg('offset')::INT;

-- name: ListWastageByProduct :many
SELECT
    w.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM wastage w
JOIN products p ON p.id = w.product_id
WHERE w.product_id = $1
ORDER BY w.created_at DESC;

-- name: ListWastageByDateRange :many
SELECT
    w.*,
    p.name AS product_name,
    p.unit AS product_unit
FROM wastage w
JOIN products p ON p.id = w.product_id
WHERE w.date >= $1 AND w.date <= $2
ORDER BY w.date ASC;

-- name: GetWastageProductID :one
-- Read without a row lock: stock writes lock the product first (see
-- stockfifo.LockRow); locking this row first would invert that order.
SELECT product_id FROM wastage
WHERE id = $1;

-- name: UpdateWastage :one
UPDATE wastage
SET product_id = $2, date = $3, qty = $4, reason = $5
WHERE id = $1
RETURNING *;

-- name: DeleteWastage :exec
DELETE FROM wastage
WHERE id = $1;

-- name: GetWastageCount :one
SELECT COUNT(*)
FROM wastage w
JOIN products p ON p.id = w.product_id
WHERE
    (sqlc.narg('product_name')::TEXT IS NULL OR p.name ILIKE '%' || sqlc.narg('product_name')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR w.date >= sqlc.narg('from')::TEXT)
    AND (sqlc.narg('to')::TEXT IS NULL OR w.date <= sqlc.narg('to')::TEXT);