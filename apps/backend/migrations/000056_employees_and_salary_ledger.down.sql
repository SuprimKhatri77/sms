-- Salary entries are money records with nowhere to go in the older schema, so
-- rolling back refuses while any exist instead of dropping them.
BEGIN;

SET LOCAL lock_timeout = '10s';

LOCK TABLE ledger_entries, employees IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM ledger_entries
        WHERE ledger_type = 'salary' OR source = 'salary_payment' OR employee_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'ledger_entries has salary entries; delete them before rolling back 000056';
    END IF;
END
$$;

ALTER TABLE ledger_entries
    DROP CONSTRAINT ledger_entries_type_check,
    DROP CONSTRAINT ledger_entries_source_check,
    DROP CONSTRAINT ledger_entries_cash_shape,
    DROP CONSTRAINT ledger_entries_bank_shape,
    DROP CONSTRAINT ledger_entries_supplier_shape,
    DROP CONSTRAINT ledger_entries_salary_shape,
    DROP CONSTRAINT ledger_entries_stock_link_check,
    DROP CONSTRAINT ledger_entries_payment_type_owner_check,
    DROP CONSTRAINT ledger_entries_supplier_payment_shape,
    DROP CONSTRAINT ledger_entries_paired_shape;

ALTER TABLE ledger_entries DROP COLUMN employee_id;

ALTER TABLE ledger_entries
    ADD CONSTRAINT ledger_entries_type_check
        CHECK (ledger_type IN ('cash', 'bank', 'supplier')),
    ADD CONSTRAINT ledger_entries_source_check
        CHECK (source IN ('manual', 'purchase', 'student_payment', 'supplier_payment')),
    ADD CONSTRAINT ledger_entries_cash_shape
        CHECK (ledger_type <> 'cash' OR (bank_account_id IS NULL AND supplier_id IS NULL)),
    ADD CONSTRAINT ledger_entries_bank_shape
        CHECK (ledger_type <> 'bank' OR (bank_account_id IS NOT NULL AND supplier_id IS NULL)),
    ADD CONSTRAINT ledger_entries_supplier_shape
        CHECK (ledger_type <> 'supplier' OR (supplier_id IS NOT NULL AND bank_account_id IS NULL AND payment_id IS NULL)),
    ADD CONSTRAINT ledger_entries_supplier_fields
        CHECK (ledger_type = 'supplier' OR (stock_in_id IS NULL AND payment_type IS NULL)),
    ADD CONSTRAINT ledger_entries_supplier_payment_shape
        CHECK (source <> 'supplier_payment' OR (ledger_type IN ('cash', 'bank') AND entry_type = 'dr')),
    ADD CONSTRAINT ledger_entries_paired_shape
        CHECK ((source = 'supplier_payment') = (paired_entry_id IS NOT NULL));

DROP TABLE employees;

COMMIT;
