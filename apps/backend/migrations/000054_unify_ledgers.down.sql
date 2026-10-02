-- Rebuilds the three per-type ledger tables (as they were after 000042) from
-- ledger_entries, keeping ids. Account groups and supplier-payment pairing
-- have nowhere to go in the old tables and are dropped.
BEGIN;

SET LOCAL lock_timeout = '10s';
LOCK TABLE payments, stock_in, suppliers, bank_accounts, account_groups, ledger_entries IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM ledger_entries WHERE ledger_type NOT IN ('cash', 'bank', 'supplier')) THEN
        RAISE EXCEPTION 'ledger rollback: entries of a ledger type the old tables cannot hold';
    END IF;
END $$;

CREATE TABLE cash_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMPTZ NOT NULL,
    bs_date TEXT NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('dr', 'cr')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    description TEXT,
    payment_id UUID CONSTRAINT cash_ledger_payment_id_fkey REFERENCES payments(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cash_ledger_date ON cash_ledger(date);
CREATE INDEX idx_cash_ledger_bs_date ON cash_ledger(bs_date);
CREATE INDEX idx_cash_ledger_payment_id ON cash_ledger(payment_id);

CREATE TABLE bank_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    date TIMESTAMPTZ NOT NULL,
    bs_date TEXT NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('dr', 'cr')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    description TEXT,
    payment_id UUID CONSTRAINT bank_ledger_payment_id_fkey REFERENCES payments(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bank_ledger_bank_account_id ON bank_ledger(bank_account_id);
CREATE INDEX idx_bank_ledger_date ON bank_ledger(date);
CREATE INDEX idx_bank_ledger_bs_date ON bank_ledger(bs_date);
CREATE INDEX idx_bank_ledger_payment_id ON bank_ledger(payment_id);

CREATE TABLE supplier_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    date TIMESTAMPTZ NOT NULL,
    bs_date TEXT NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('dr', 'cr')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    description TEXT,
    stock_in_id UUID REFERENCES stock_in(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- last, where 000040 added it
    payment_type TEXT NOT NULL
);
CREATE INDEX idx_supplier_ledger_supplier_id ON supplier_ledger(supplier_id);
CREATE INDEX idx_supplier_ledger_date ON supplier_ledger(date);
CREATE INDEX idx_supplier_ledger_bs_date ON supplier_ledger(bs_date);
CREATE INDEX idx_supplier_ledger_stock_in_id ON supplier_ledger(stock_in_id);

INSERT INTO cash_ledger (id, date, bs_date, entry_type, amount, description, payment_id, created_at)
SELECT id, date, bs_date, entry_type, amount, description, payment_id, created_at
FROM ledger_entries WHERE ledger_type = 'cash';

INSERT INTO bank_ledger (id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at)
SELECT id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at
FROM ledger_entries WHERE ledger_type = 'bank';

INSERT INTO supplier_ledger (id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id, payment_type, created_at)
SELECT id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id, COALESCE(payment_type, ''), created_at
FROM ledger_entries WHERE ledger_type = 'supplier';

DO $$
DECLARE
    diff BIGINT;
BEGIN
    SELECT COUNT(*) INTO diff FROM (
        SELECT id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM ledger_entries WHERE ledger_type = 'cash'
        EXCEPT
        SELECT id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM cash_ledger
    ) d;
    IF diff <> 0 THEN
        RAISE EXCEPTION 'ledger rollback: % cash rows differ', diff;
    END IF;

    SELECT COUNT(*) INTO diff FROM (
        SELECT id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM ledger_entries WHERE ledger_type = 'bank'
        EXCEPT
        SELECT id, bank_account_id, date, bs_date, entry_type, amount, description, payment_id, created_at FROM bank_ledger
    ) d;
    IF diff <> 0 THEN
        RAISE EXCEPTION 'ledger rollback: % bank rows differ', diff;
    END IF;

    SELECT COUNT(*) INTO diff FROM (
        SELECT id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id, COALESCE(payment_type, ''), created_at FROM ledger_entries WHERE ledger_type = 'supplier'
        EXCEPT
        SELECT id, supplier_id, date, bs_date, entry_type, amount, description, stock_in_id, payment_type, created_at FROM supplier_ledger
    ) d;
    IF diff <> 0 THEN
        RAISE EXCEPTION 'ledger rollback: % supplier rows differ', diff;
    END IF;

    -- the old tables were filled from ledger_entries only, so equal counts
    -- plus the checks above mean nothing was lost or added
    IF (SELECT COUNT(*) FROM ledger_entries) <>
       (SELECT COUNT(*) FROM cash_ledger) + (SELECT COUNT(*) FROM bank_ledger) + (SELECT COUNT(*) FROM supplier_ledger) THEN
        RAISE EXCEPTION 'ledger rollback: row counts differ';
    END IF;
END $$;

DROP TABLE ledger_entries;
DROP TABLE IF EXISTS legacy_cash_ledger_054;
DROP TABLE IF EXISTS legacy_bank_ledger_054;
DROP TABLE IF EXISTS legacy_supplier_ledger_054;

COMMIT;
