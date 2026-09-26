-- name: CreateBankLedgerEntry :one
INSERT INTO bank_ledger (bank_account_id, date, bs_date, entry_type, amount, description, payment_id)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetBankLedgerEntryByID :one
SELECT
    bl.*,
    ba.account_name,
    ba.account_number,
    b.name AS bank_name
FROM bank_ledger bl
JOIN bank_accounts ba ON ba.id = bl.bank_account_id
JOIN banks b ON b.id = ba.bank_id
WHERE bl.id = $1;

-- name: ListBankLedger :many
SELECT
    bl.*,
    ba.account_name,
    ba.account_number,
    b.name AS bank_name
FROM bank_ledger bl
JOIN bank_accounts ba ON ba.id = bl.bank_account_id
JOIN banks b ON b.id = ba.bank_id
WHERE
    (sqlc.narg('bank_account_id')::uuid IS NULL OR bl.bank_account_id = sqlc.narg('bank_account_id')::uuid)
    AND (sqlc.narg('bank_id')::uuid IS NULL OR ba.bank_id = sqlc.narg('bank_id')::uuid)
    AND (sqlc.narg('from_date')::date IS NULL OR bl.date >= sqlc.narg('from_date')::timestamptz)
    AND (sqlc.narg('to_date')::date IS NULL OR bl.date <= sqlc.narg('to_date')::timestamptz)
ORDER BY bl.date DESC
LIMIT sqlc.narg('limit')::INT OFFSET sqlc.arg('offset')::INT;

-- name: ListBankLedgerByAccount :many
SELECT
    bl.*,
    ba.account_name,
    ba.account_number,
    b.name AS bank_name,
    COUNT(*) OVER() AS total_count
FROM bank_ledger bl
JOIN bank_accounts ba ON ba.id = bl.bank_account_id
JOIN banks b ON b.id = ba.bank_id
WHERE bl.bank_account_id = $1
ORDER BY bl.date DESC
LIMIT $2 OFFSET $3;

-- name: ListBankLedgerByDateRange :many
SELECT
    bl.*,
    ba.account_name,
    ba.account_number,
    b.name AS bank_name
FROM bank_ledger bl
JOIN bank_accounts ba ON ba.id = bl.bank_account_id
JOIN banks b ON b.id = ba.bank_id
WHERE bl.bs_date >= $1 AND bl.bs_date <= $2
ORDER BY bl.date ASC;


-- name: GetBankLedgerSummary :one
SELECT
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) AS total_cr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS total_dr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) -
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS balance
FROM bank_ledger bl
JOIN bank_accounts ba ON ba.id = bl.bank_account_id
WHERE
    (sqlc.narg('bank_account_id')::uuid IS NULL OR bl.bank_account_id = sqlc.narg('bank_account_id')::uuid)
    AND (sqlc.narg('bank_id')::uuid IS NULL OR ba.bank_id = sqlc.narg('bank_id')::uuid)
    AND (sqlc.narg('from_date')::date IS NULL OR bl.date >= sqlc.narg('from_date')::timestamptz)
    AND (sqlc.narg('to_date')::date IS NULL OR bl.date <= sqlc.narg('to_date')::timestamptz);

-- name: GetBankLedgerSummaryByAccount :one
SELECT
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) AS total_cr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS total_dr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) -
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS balance
FROM bank_ledger
WHERE bank_account_id = $1;

-- name: GetBankLedgerSummaryAll :one
SELECT
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) AS total_cr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS total_dr,
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'cr'), 0) -
    COALESCE(SUM(amount) FILTER (WHERE entry_type = 'dr'), 0) AS balance
FROM bank_ledger;

-- name: GetBankLedgerCount :one
SELECT COUNT(*) FROM bank_ledger bl
JOIN bank_accounts ba ON ba.id = bl.bank_account_id
WHERE
    (sqlc.narg('bank_account_id')::uuid IS NULL OR bl.bank_account_id = sqlc.narg('bank_account_id')::uuid)
    AND (sqlc.narg('bank_id')::uuid IS NULL OR ba.bank_id = sqlc.narg('bank_id')::uuid)
    AND (sqlc.narg('from_date')::date IS NULL OR bl.date >= sqlc.narg('from_date')::timestamptz)
    AND (sqlc.narg('to_date')::date IS NULL OR bl.date <= sqlc.narg('to_date')::timestamptz);

-- name: DeleteBankLedgerEntry :exec
DELETE FROM bank_ledger WHERE id = $1;