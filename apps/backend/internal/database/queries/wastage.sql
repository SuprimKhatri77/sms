-- name: CreateWastage :one
INSERT INTO wastage (product_id, date, qty, rate, reason)
VALUES ($1, $2, $3, $4, $5)
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
    p.unit AS product_unit
FROM wastage w
JOIN products p ON p.id = w.product_id
WHERE
    (sqlc.narg('product_name')::TEXT IS NULL OR p.name ILIKE '%' || sqlc.narg('product_name')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR w.date >= sqlc.narg('from')::TEXT)
    AND (sqlc.narg('to')::TEXT IS NULL OR w.date <= sqlc.narg('to')::TEXT)
ORDER BY
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'asc' THEN w.rate END ASC,
    CASE WHEN sqlc.narg('sort_by_rate')::TEXT = 'desc' THEN w.rate END DESC,
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

-- name: UpdateWastage :one
UPDATE wastage
SET product_id = $2, date = $3, qty = $4, rate = $5, reason = $6
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