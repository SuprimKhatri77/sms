-- name: GetSetting :one
SELECT value FROM settings WHERE key = $1;

-- name: UpdateSetting :one
UPDATE settings SET value = $2 WHERE key = $1 RETURNING *;

-- name: GetAdmissionSettings :many
SELECT key, value FROM settings
WHERE key IN ('ref_prefix', 'fiscal_year');