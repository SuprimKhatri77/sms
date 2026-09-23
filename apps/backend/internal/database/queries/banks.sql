-- name: CreateBank :one
INSERT INTO banks (name)
VALUES ($1)
RETURNING *;

-- name: GetBankByID :one
SELECT * FROM banks WHERE id = $1;

-- name: GetDefaultBank :one
SELECT * FROM banks WHERE is_default = TRUE;

-- name: ListBanks :many
SELECT * FROM banks
WHERE
    (sqlc.narg('name')::TEXT IS NULL OR name ILIKE '%' || sqlc.narg('name')::TEXT || '%')
ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: UpdateBank :one
UPDATE banks
SET name = $2
WHERE id = $1
RETURNING *;

-- name: UnsetDefaultBank :exec
UPDATE banks SET is_default = FALSE WHERE is_default = TRUE;

-- name: SetBankAsDefault :execresult
UPDATE banks SET is_default = TRUE WHERE id = $1;

-- name: DeleteBank :execresult
DELETE FROM banks WHERE id = $1;

-- name: GetBanksCount :one
SELECT COUNT(*) FROM banks
WHERE
    (sqlc.narg('name')::TEXT IS NULL OR name ILIKE '%' || sqlc.narg('name')::TEXT || '%');

-- name: IsBankDefault :one
SELECT is_default FROM banks WHERE id = $1;