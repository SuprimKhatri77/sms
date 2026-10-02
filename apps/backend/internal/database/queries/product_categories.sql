-- name: ListProductCategories :many
SELECT
    c.*,
    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id)::INT AS product_count
FROM product_categories c
ORDER BY LOWER(c.name) ASC;

-- name: CreateProductCategory :one
INSERT INTO product_categories (parent_id, name, description)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateProductCategory :one
UPDATE product_categories
SET parent_id = $2, name = $3, description = $4
WHERE id = $1
RETURNING *;

-- name: DeleteProductCategory :execresult
DELETE FROM product_categories WHERE id = $1;

-- Serialises every structural change to the category tree for the rest of
-- the transaction, so two concurrent moves can't each pass the cycle check
-- and together form a loop.
-- name: LockProductCategoryTree :exec
SELECT pg_advisory_xact_lock(hashtext('product_categories_tree'));

-- Walks up from the proposed parent; if the category being moved shows up
-- among those ancestors, the move would create a cycle. UNION (not UNION ALL)
-- stops the walk even if the data somehow already contains a loop.
-- name: IsProductCategoryInSubtree :one
WITH RECURSIVE ancestors AS (
    SELECT pc.id, pc.parent_id FROM product_categories pc WHERE pc.id = sqlc.arg(parent_id)::UUID
    UNION
    SELECT c.id, c.parent_id FROM product_categories c
    JOIN ancestors a ON c.id = a.parent_id
)
SELECT EXISTS (SELECT 1 FROM ancestors WHERE ancestors.id = sqlc.arg(category_id)::UUID);
