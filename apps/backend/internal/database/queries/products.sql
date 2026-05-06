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

-- name: ListProducts :many
SELECT * FROM products
ORDER BY name ASC;

-- name: UpdateProduct :one
UPDATE products
SET name = $2, unit = $3
WHERE id = $1
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products
WHERE id = $1;

-- name: GetLatestStockInRateForProduct :one
-- used to autofill rate in stock_out and wastage forms
SELECT rate FROM stock_in
WHERE product_id = $1
ORDER BY created_at DESC
LIMIT 1;