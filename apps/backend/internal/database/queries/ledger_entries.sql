-- name: CreateLedgerEntry :one
INSERT INTO ledger_entries (
    ledger_type, source, bank_account_id, supplier_id, account_group_id,
    payment_id, stock_in_id, paired_entry_id, date, bs_date, entry_type,
    amount, description, payment_type
)
VALUES (
    @ledger_type, @source, @bank_account_id, @supplier_id, @account_group_id,
    @payment_id, @stock_in_id, @paired_entry_id, @date, @bs_date, @entry_type,
    @amount, @description, @payment_type
)
RETURNING *;

-- name: GetLedgerEntryByID :one
SELECT
    le.*,
    s.company_name AS supplier_name,
    b.name AS bank_name,
    ba.account_name,
    ba.account_number,
    ag.name AS account_group_name,
    -- a supplier payment's cash/bank side, and the account the money left
    -- from (none for cash), so the entry can be shown and edited with it
    pe.id AS counter_entry_id,
    pe.bank_account_id AS paid_from_account_id,
    pba.account_name AS paid_from_account_name,
    pb.name AS paid_from_bank_name
FROM ledger_entries le
LEFT JOIN suppliers s ON s.id = le.supplier_id
LEFT JOIN bank_accounts ba ON ba.id = le.bank_account_id
LEFT JOIN banks b ON b.id = ba.bank_id
LEFT JOIN account_groups ag ON ag.id = le.account_group_id
-- at most one: ledger_entries_paired_entry_key
LEFT JOIN ledger_entries pe ON pe.paired_entry_id = le.id
LEFT JOIN bank_accounts pba ON pba.id = pe.bank_account_id
LEFT JOIN banks pb ON pb.id = pba.bank_id
WHERE le.id = $1;

-- Every filter is optional. Ties on date fall back to created_at and id so
-- paging through entries on the same day never repeats or skips a row.
-- name: ListLedgerEntries :many
SELECT
    le.*,
    s.company_name AS supplier_name,
    b.name AS bank_name,
    ba.account_name,
    ba.account_number,
    ag.name AS account_group_name,
    -- a supplier payment's cash/bank side, and the account the money left
    -- from (none for cash), so the entry can be shown and edited with it
    pe.id AS counter_entry_id,
    pe.bank_account_id AS paid_from_account_id,
    pba.account_name AS paid_from_account_name,
    pb.name AS paid_from_bank_name
FROM ledger_entries le
LEFT JOIN suppliers s ON s.id = le.supplier_id
LEFT JOIN bank_accounts ba ON ba.id = le.bank_account_id
LEFT JOIN banks b ON b.id = ba.bank_id
LEFT JOIN account_groups ag ON ag.id = le.account_group_id
-- at most one: ledger_entries_paired_entry_key
LEFT JOIN ledger_entries pe ON pe.paired_entry_id = le.id
LEFT JOIN bank_accounts pba ON pba.id = pe.bank_account_id
LEFT JOIN banks pb ON pb.id = pba.bank_id
WHERE
    (sqlc.narg('ledger_type')::TEXT IS NULL OR le.ledger_type = sqlc.narg('ledger_type')::TEXT)
    AND (sqlc.narg('supplier_id')::UUID IS NULL OR le.supplier_id = sqlc.narg('supplier_id')::UUID)
    AND (sqlc.narg('bank_id')::UUID IS NULL OR ba.bank_id = sqlc.narg('bank_id')::UUID)
    AND (sqlc.narg('bank_account_id')::UUID IS NULL OR le.bank_account_id = sqlc.narg('bank_account_id')::UUID)
    AND (sqlc.narg('account_group_id')::UUID IS NULL OR le.account_group_id = sqlc.narg('account_group_id')::UUID)
    AND (sqlc.narg('from_date')::DATE IS NULL OR le.date >= sqlc.narg('from_date')::TIMESTAMPTZ)
    AND (sqlc.narg('to_date')::DATE IS NULL OR le.date <= sqlc.narg('to_date')::TIMESTAMPTZ)
ORDER BY le.date DESC, le.created_at DESC, le.id DESC
LIMIT sqlc.narg('limit')::INT OFFSET sqlc.arg('offset')::INT;

-- name: GetLedgerEntryCount :one
SELECT COUNT(*)
FROM ledger_entries le
LEFT JOIN bank_accounts ba ON ba.id = le.bank_account_id
WHERE
    (sqlc.narg('ledger_type')::TEXT IS NULL OR le.ledger_type = sqlc.narg('ledger_type')::TEXT)
    AND (sqlc.narg('supplier_id')::UUID IS NULL OR le.supplier_id = sqlc.narg('supplier_id')::UUID)
    AND (sqlc.narg('bank_id')::UUID IS NULL OR ba.bank_id = sqlc.narg('bank_id')::UUID)
    AND (sqlc.narg('bank_account_id')::UUID IS NULL OR le.bank_account_id = sqlc.narg('bank_account_id')::UUID)
    AND (sqlc.narg('account_group_id')::UUID IS NULL OR le.account_group_id = sqlc.narg('account_group_id')::UUID)
    AND (sqlc.narg('from_date')::DATE IS NULL OR le.date >= sqlc.narg('from_date')::TIMESTAMPTZ)
    AND (sqlc.narg('to_date')::DATE IS NULL OR le.date <= sqlc.narg('to_date')::TIMESTAMPTZ);

-- One row per ledger type that has entries matching the filters; balance is
-- credits minus debits, the way every ledger here has always shown it.
-- name: GetLedgerSummary :many
SELECT
    le.ledger_type,
    COALESCE(SUM(le.amount) FILTER (WHERE le.entry_type = 'cr'), 0)::BIGINT AS total_cr,
    COALESCE(SUM(le.amount) FILTER (WHERE le.entry_type = 'dr'), 0)::BIGINT AS total_dr,
    (COALESCE(SUM(le.amount) FILTER (WHERE le.entry_type = 'cr'), 0) -
     COALESCE(SUM(le.amount) FILTER (WHERE le.entry_type = 'dr'), 0))::BIGINT AS balance
FROM ledger_entries le
LEFT JOIN bank_accounts ba ON ba.id = le.bank_account_id
WHERE
    (sqlc.narg('ledger_type')::TEXT IS NULL OR le.ledger_type = sqlc.narg('ledger_type')::TEXT)
    AND (sqlc.narg('supplier_id')::UUID IS NULL OR le.supplier_id = sqlc.narg('supplier_id')::UUID)
    AND (sqlc.narg('bank_id')::UUID IS NULL OR ba.bank_id = sqlc.narg('bank_id')::UUID)
    AND (sqlc.narg('bank_account_id')::UUID IS NULL OR le.bank_account_id = sqlc.narg('bank_account_id')::UUID)
    AND (sqlc.narg('account_group_id')::UUID IS NULL OR le.account_group_id = sqlc.narg('account_group_id')::UUID)
    AND (sqlc.narg('from_date')::DATE IS NULL OR le.date >= sqlc.narg('from_date')::TIMESTAMPTZ)
    AND (sqlc.narg('to_date')::DATE IS NULL OR le.date <= sqlc.narg('to_date')::TIMESTAMPTZ)
GROUP BY le.ledger_type
ORDER BY le.ledger_type;

-- name: GetLedgerEntryForUpdate :one
SELECT * FROM ledger_entries WHERE id = $1 FOR UPDATE;

-- the cash/bank side of a supplier payment, if it has one
-- name: GetPairedLedgerEntry :one
SELECT * FROM ledger_entries WHERE paired_entry_id = $1 FOR UPDATE;

-- name: UpdateLedgerEntry :one
UPDATE ledger_entries
SET bank_account_id = @bank_account_id,
    supplier_id = @supplier_id,
    account_group_id = @account_group_id,
    stock_in_id = @stock_in_id,
    date = @date,
    bs_date = @bs_date,
    entry_type = @entry_type,
    amount = @amount,
    description = @description,
    payment_type = @payment_type
WHERE id = @id
RETURNING *;

-- name: DeleteLedgerEntry :exec
DELETE FROM ledger_entries WHERE id = $1;

-- name: DeletePairedLedgerEntry :exec
DELETE FROM ledger_entries WHERE paired_entry_id = $1;

-- The credit a purchase records for its supplier is marked source='purchase',
-- so these never touch a manual entry that merely links to the purchase.

-- name: UpdatePurchaseLedgerCredit :execrows
UPDATE ledger_entries
SET supplier_id = @supplier_id,
    date = @date,
    bs_date = @bs_date,
    amount = @amount,
    description = @description
WHERE source = 'purchase' AND stock_in_id = @stock_in_id;

-- name: DeletePurchaseLedgerCredit :exec
DELETE FROM ledger_entries WHERE source = 'purchase' AND stock_in_id = $1;
