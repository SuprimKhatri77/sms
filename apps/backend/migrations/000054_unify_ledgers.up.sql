-- One ledger table for every ledger type (cash, bank, supplier, and whatever
-- comes next) instead of a table per type.
--
-- The data moves in one transaction and checks itself before the old tables
-- are dropped: if any row didn't come across exactly, the whole migration
-- rolls back and the old tables are left as they were.
BEGIN;

-- The service is stopped while migrating, but take every lock up front anyway:
-- nothing then needs a lock upgrade halfway, and anything still holding a lock
-- makes this fail fast instead of deadlocking.
SET LOCAL lock_timeout = '10s';
LOCK TABLE payments, stock_in, suppliers, bank_accounts, account_groups,
    cash_ledger, bank_ledger, supplier_ledger IN ACCESS EXCLUSIVE MODE;

-- Raw copies of the old rows (no constraints, so they block nothing), kept
-- until prod is verified; a later migration drops them.
CREATE TABLE legacy_cash_ledger_054 AS TABLE cash_ledger;
CREATE TABLE legacy_bank_ledger_054 AS TABLE bank_ledger;
CREATE TABLE legacy_supplier_ledger_054 AS TABLE supplier_ledger;

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_type TEXT NOT NULL,
    -- what wrote the entry: a person, or the purchase / payment it belongs to
    source TEXT NOT NULL DEFAULT 'manual',
    bank_account_id UUID CONSTRAINT ledger_entries_bank_account_id_fkey REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    supplier_id UUID CONSTRAINT ledger_entries_supplier_id_fkey REFERENCES suppliers(id) ON DELETE RESTRICT,
    account_group_id UUID CONSTRAINT ledger_entries_account_group_id_fkey REFERENCES account_groups(id) ON DELETE RESTRICT,
    payment_id UUID CONSTRAINT ledger_entries_payment_id_fkey REFERENCES payments(id) ON DELETE RESTRICT,
    stock_in_id UUID CONSTRAINT ledger_entries_stock_in_id_fkey REFERENCES stock_in(id) ON DELETE SET NULL,
    -- on the cash/bank side of a supplier payment: the supplier entry it pays
    paired_entry_id UUID CONSTRAINT ledger_entries_paired_entry_id_fkey REFERENCES ledger_entries(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    bs_date TEXT NOT NULL,
    entry_type TEXT NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT,
    payment_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ledger_entries_type_check CHECK (ledger_type IN ('cash', 'bank', 'supplier')),
    CONSTRAINT ledger_entries_source_check CHECK (source IN ('manual', 'purchase', 'student_payment', 'supplier_payment')),
    CONSTRAINT ledger_entries_entry_type_check CHECK (entry_type IN ('dr', 'cr')),
    CONSTRAINT ledger_entries_amount_check CHECK (amount > 0),
    CONSTRAINT ledger_entries_payment_type_check CHECK (payment_type IS NULL OR btrim(payment_type) <> ''),

    -- each ledger type's shape
    CONSTRAINT ledger_entries_cash_shape CHECK (ledger_type <> 'cash' OR (bank_account_id IS NULL AND supplier_id IS NULL)),
    CONSTRAINT ledger_entries_bank_shape CHECK (ledger_type <> 'bank' OR (bank_account_id IS NOT NULL AND supplier_id IS NULL)),
    CONSTRAINT ledger_entries_supplier_shape CHECK (ledger_type <> 'supplier' OR (supplier_id IS NOT NULL AND bank_account_id IS NULL AND payment_id IS NULL)),
    CONSTRAINT ledger_entries_supplier_fields CHECK (ledger_type = 'supplier' OR (stock_in_id IS NULL AND payment_type IS NULL)),

    -- each source's shape
    CONSTRAINT ledger_entries_student_payment_shape CHECK ((source = 'student_payment') = (payment_id IS NOT NULL)),
    CONSTRAINT ledger_entries_purchase_shape CHECK (source <> 'purchase' OR (ledger_type = 'supplier' AND entry_type = 'cr' AND stock_in_id IS NOT NULL)),
    CONSTRAINT ledger_entries_supplier_payment_shape CHECK (source <> 'supplier_payment' OR (ledger_type IN ('cash', 'bank') AND entry_type = 'dr')),
    CONSTRAINT ledger_entries_paired_shape CHECK ((source = 'supplier_payment') = (paired_entry_id IS NOT NULL)),
    CONSTRAINT ledger_entries_not_own_pair CHECK (paired_entry_id IS NULL OR paired_entry_id <> id)
);

-- one auto-recorded credit per purchase, one cash/bank side per supplier payment
CREATE UNIQUE INDEX ledger_entries_purchase_credit_key ON ledger_entries(stock_in_id) WHERE source = 'purchase';
CREATE UNIQUE INDEX ledger_entries_paired_entry_key ON ledger_entries(paired_entry_id) WHERE paired_entry_id IS NOT NULL;

CREATE INDEX idx_ledger_entries_type_date ON ledger_entries(ledger_type, date DESC);
CREATE INDEX idx_ledger_entries_date ON ledger_entries(date DESC);
CREATE INDEX idx_ledger_entries_bs_date ON ledger_entries(bs_date);
CREATE INDEX idx_ledger_entries_bank_account_id ON ledger_entries(bank_account_id);
CREATE INDEX idx_ledger_entries_supplier_id ON ledger_entries(supplier_id);
CREATE INDEX idx_ledger_entries_account_group_id ON ledger_entries(account_group_id);
CREATE INDEX idx_ledger_entries_payment_id ON ledger_entries(payment_id);
CREATE INDEX idx_ledger_entries_stock_in_id ON ledger_entries(stock_in_id);

-- move the rows, keeping their ids
INSERT INTO ledger_entries (id, ledger_type, source, date, bs_date, entry_type, amount, description, payment_id, created_at)
SELECT id, 'cash', CASE WHEN payment_id IS NOT NULL THEN 'student_payment' ELSE 'manual' END,
       date, bs_date, entry_type, amount, description, payment_id, created_at
FROM cash_ledger;

INSERT INTO ledger_entries (id, ledger_type, source, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at)
SELECT id, 'bank', CASE WHEN payment_id IS NOT NULL THEN 'student_payment' ELSE 'manual' END,
       bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at
FROM bank_ledger;

-- payment_type was NOT NULL with '' meaning "none"; it's NULL now
INSERT INTO ledger_entries (id, ledger_type, source, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id, payment_type, created_at)
SELECT id, 'supplier', 'manual',
       supplier_id, date, bs_date, entry_type, amount, description, stock_in_id,
       CASE WHEN btrim(payment_type) = '' THEN NULL ELSE payment_type END, created_at
FROM supplier_ledger;

-- A purchase's own credit is inserted in the purchase's transaction, so its
-- created_at (that transaction's NOW()) is never after the purchase's own
-- (NOW() before 000053, clock_timestamp() since). A manual entry pointing at
-- a purchase can only be made once the purchase has committed, so it is
-- always later.
UPDATE ledger_entries le
SET source = 'purchase'
FROM stock_in si
WHERE le.ledger_type = 'supplier'
    AND le.entry_type = 'cr'
    AND le.stock_in_id = si.id
    AND le.created_at <= si.created_at;

-- A supplier payment wrote its cash/bank debit in the same transaction, so the
-- two share created_at (NOW()), amount and dates. Only matches that are unique
-- both ways are linked; anything else (older rows written before the debit
-- direction was fixed, or before counter entries existed) stays manual.
WITH candidates AS (
    SELECT cb.id AS counter_id,
           s.id AS supplier_entry_id,
           COUNT(*) OVER (PARTITION BY cb.id) AS matches_per_counter,
           COUNT(*) OVER (PARTITION BY s.id) AS matches_per_supplier_entry
    FROM ledger_entries cb
    JOIN ledger_entries s
        ON s.ledger_type = 'supplier'
        AND s.entry_type = 'dr'
        AND s.payment_type IS NOT NULL
        AND s.created_at = cb.created_at
        AND s.amount = cb.amount
        AND s.date = cb.date
        AND s.bs_date = cb.bs_date
    WHERE cb.ledger_type IN ('cash', 'bank')
        AND cb.entry_type = 'dr'
        AND cb.payment_id IS NULL
        AND cb.description LIKE 'Supplier payment - %'
)
UPDATE ledger_entries le
SET source = 'supplier_payment', paired_entry_id = c.supplier_entry_id
FROM candidates c
WHERE le.id = c.counter_id
    AND c.matches_per_counter = 1
    AND c.matches_per_supplier_entry = 1;

-- Every old row must be in the new table exactly, and nothing else. Compares
-- whole rows both ways, so a changed value fails as well as a missing row.
DO $$
DECLARE
    diff BIGINT;
BEGIN
    SELECT COUNT(*) INTO diff FROM (
        (SELECT id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM cash_ledger
         EXCEPT
         SELECT id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM ledger_entries WHERE ledger_type = 'cash')
        UNION ALL
        (SELECT id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM ledger_entries WHERE ledger_type = 'cash'
         EXCEPT
         SELECT id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM cash_ledger)
    ) d;
    IF diff <> 0 THEN
        RAISE EXCEPTION 'ledger migration: % cash rows differ', diff;
    END IF;

    SELECT COUNT(*) INTO diff FROM (
        (SELECT id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM bank_ledger
         EXCEPT
         SELECT id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM ledger_entries WHERE ledger_type = 'bank')
        UNION ALL
        (SELECT id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM ledger_entries WHERE ledger_type = 'bank'
         EXCEPT
         SELECT id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM bank_ledger)
    ) d;
    IF diff <> 0 THEN
        RAISE EXCEPTION 'ledger migration: % bank rows differ', diff;
    END IF;

    SELECT COUNT(*) INTO diff FROM (
        (SELECT id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id,
                CASE WHEN btrim(payment_type) = '' THEN NULL ELSE payment_type END, created_at
         FROM supplier_ledger
         EXCEPT
         SELECT id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id, payment_type, created_at
         FROM ledger_entries WHERE ledger_type = 'supplier')
        UNION ALL
        (SELECT id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id, payment_type, created_at
         FROM ledger_entries WHERE ledger_type = 'supplier'
         EXCEPT
         SELECT id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id,
                CASE WHEN btrim(payment_type) = '' THEN NULL ELSE payment_type END, created_at
         FROM supplier_ledger)
    ) d;
    IF diff <> 0 THEN
        RAISE EXCEPTION 'ledger migration: % supplier rows differ', diff;
    END IF;

    -- EXCEPT ignores duplicates, so the counts must match as well
    IF (SELECT COUNT(*) FROM ledger_entries) <>
       (SELECT COUNT(*) FROM cash_ledger) + (SELECT COUNT(*) FROM bank_ledger) + (SELECT COUNT(*) FROM supplier_ledger) THEN
        RAISE EXCEPTION 'ledger migration: row counts differ';
    END IF;
END $$;

DROP TABLE cash_ledger;
DROP TABLE bank_ledger;
DROP TABLE supplier_ledger;

COMMIT;
