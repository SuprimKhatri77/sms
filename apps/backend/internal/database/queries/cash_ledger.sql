-- name: CreateCashLedgerEntry :one
INSERT INTO cash_ledger (date, bs_date, entry_type, amount, description, payment_id)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetCashLedgerEntryByID :one
SELECT * FROM cash_ledger WHERE id = $1;

-- name: ListCashLedger :many
SELECT * FROM cash_ledger
WHERE
    (sqlc.narg('from_date')::date IS NULL OR date >= sqlc.narg('from_date')::timestamptz)
    AND (sqlc.narg('to_date')::date IS NULL OR date <= sqlc.narg('to_date')::timestamptz)
ORDER BY date DESC
LIMIT sqlc.narg('limit')::INT OFFSET sqlc.arg('offset')::INT;


-- name: ListCashLedgerByDateRange :many
SELECT * FROM cash_ledger
WHERE bs_date >= $1 AND bs_date <= $2
ORDER BY date ASC;

-- name: GetCashLedgerSummary :one
SELECT
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) AS total_cr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS total_dr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) -
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS balance
FROM cash_ledger
WHERE
    (sqlc.narg('from_date')::date IS NULL OR date >= sqlc.narg('from_date')::timestamptz)
    AND (sqlc.narg('to_date')::date IS NULL OR date <= sqlc.narg('to_date')::timestamptz);

-- name: GetCashLedgerCount :one
SELECT COUNT(*) FROM cash_ledger
WHERE
    (sqlc.narg('from_date')::date IS NULL OR date >= sqlc.narg('from_date')::timestamptz)
    AND (sqlc.narg('to_date')::date IS NULL OR date <= sqlc.narg('to_date')::timestamptz);

-- name: DeleteCashLedgerEntry :exec
DELETE FROM cash_ledger WHERE id = $1;