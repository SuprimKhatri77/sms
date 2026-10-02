-- name: CreateProduct :one
INSERT INTO products (name, unit, category_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetProductByID :one
SELECT * FROM products
WHERE id = $1;

-- name: GetProductByName :one
SELECT * FROM products
WHERE name = $1;

-- name: UpdateProduct :one
UPDATE products
SET name = $2, unit = $3, category_id = $4
WHERE id = $1
RETURNING *;

-- name: DeleteProduct :execresult
DELETE FROM products
WHERE id = $1;

-- name: GetLatestStockInRateForProduct :one
SELECT rate FROM stock_in
WHERE product_id = $1
ORDER BY created_at DESC
LIMIT 1;

-- name: ListProducts :many
SELECT
    products.*,
    cp.path AS category_path,
    (
        COALESCE((SELECT SUM(si.qty) FROM stock_in si WHERE si.product_id = products.id), 0)
        - COALESCE((SELECT SUM(so.qty) FROM stock_out so WHERE so.product_id = products.id), 0)
        - COALESCE((SELECT SUM(w.qty) FROM wastage w WHERE w.product_id = products.id), 0)
    )::FLOAT8 AS in_stock
FROM products
LEFT JOIN product_category_paths cp ON cp.category_id = products.category_id
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