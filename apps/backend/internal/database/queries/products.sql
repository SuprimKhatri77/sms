-- name: CreateProduct :one
INSERT INTO products (name, unit)
VALUES ($1, $2)
RETURNING *;

-- name: GetProductByID :one
SELECT * FROM products
WHERE id = $1;

-- name: GetProductByName :one
SELECT * FROM products
WHERE name = $1;

-- name: UpdateProduct :one
UPDATE products
SET name = $2, unit = $3
WHERE id = $1
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products
WHERE id = $1;

-- name: GetLatestStockInRateForProduct :one
SELECT rate FROM stock_in
WHERE product_id = $1
ORDER BY created_at DESC
LIMIT 1;

-- name: ListProducts :many
SELECT * FROM products
WHERE
    (sqlc.narg('name')::TEXT IS NULL OR name ILIKE '%' || sqlc.narg('name')::TEXT || '%')
    AND (sqlc.narg('from')::DATE IS NULL OR created_at::DATE >= sqlc.narg('from')::DATE)
    AND (sqlc.narg('to')::DATE IS NULL OR created_at::DATE <= sqlc.narg('to')::DATE)
ORDER BY name ASC
LIMIT sqlc.narg('limit')::INT OFFSET sqlc.arg('offset')::INT;

-- name: GetProductCount :one
SELECT COUNT(*) FROM products
WHERE
    (sqlc.narg('name')::TEXT IS NULL OR name ILIKE '%' || sqlc.narg('name')::TEXT || '%')
    AND (sqlc.narg('from')::DATE IS NULL OR created_at::DATE >= sqlc.narg('from')::DATE)
    AND (sqlc.narg('to')::DATE IS NULL OR created_at::DATE <= sqlc.narg('to')::DATE);