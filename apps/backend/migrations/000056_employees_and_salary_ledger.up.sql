-- Employees, and a salary ledger in ledger_entries. A salary entry is with an
-- employee, the way a supplier entry is with a supplier: a credit is salary
-- due, a debit is salary paid, and a payment's cash/bank side is linked to it
-- (source 'salary_payment'), as a supplier payment's is.
BEGIN;

SET LOCAL lock_timeout = '10s';

-- Each employee gets a number from an identity (never reused, so a code on
-- an old printout always means the same person) and a code made from it:
-- EMP-001, ..., EMP-999, EMP-1000. Names aren't unique; the code tells two
-- people with the same name apart.
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_no INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    code TEXT NOT NULL GENERATED ALWAYS AS
        ('EMP-' || lpad(employee_no::TEXT, GREATEST(3, length(employee_no::TEXT)), '0')) STORED,
    full_name TEXT NOT NULL,
    phone TEXT,
    designation TEXT,
    address TEXT,
    pan_no TEXT,
    notes TEXT,
    monthly_salary BIGINT,
    join_date DATE,
    join_date_bs TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT employees_employee_no_key UNIQUE (employee_no),
    CONSTRAINT employees_code_key UNIQUE (code),
    CONSTRAINT employees_status_check CHECK (status IN ('active', 'inactive')),
    CONSTRAINT employees_monthly_salary_check CHECK (monthly_salary IS NULL OR monthly_salary > 0),
    CONSTRAINT employees_join_date_pair CHECK ((join_date IS NULL) = (join_date_bs IS NULL))
);

CREATE UNIQUE INDEX employees_pan_no_key ON employees(pan_no) WHERE pan_no IS NOT NULL;
CREATE INDEX idx_employees_full_name ON employees(full_name);

ALTER TABLE ledger_entries
    ADD COLUMN employee_id UUID CONSTRAINT ledger_entries_employee_id_fkey REFERENCES employees(id) ON DELETE RESTRICT;

CREATE INDEX idx_ledger_entries_employee_id ON ledger_entries(employee_id);

ALTER TABLE ledger_entries
    DROP CONSTRAINT ledger_entries_type_check,
    DROP CONSTRAINT ledger_entries_source_check,
    DROP CONSTRAINT ledger_entries_cash_shape,
    DROP CONSTRAINT ledger_entries_bank_shape,
    DROP CONSTRAINT ledger_entries_supplier_shape,
    DROP CONSTRAINT ledger_entries_supplier_fields,
    DROP CONSTRAINT ledger_entries_supplier_payment_shape,
    DROP CONSTRAINT ledger_entries_paired_shape;

ALTER TABLE ledger_entries
    ADD CONSTRAINT ledger_entries_type_check
        CHECK (ledger_type IN ('cash', 'bank', 'supplier', 'salary')),
    ADD CONSTRAINT ledger_entries_source_check
        CHECK (source IN ('manual', 'purchase', 'student_payment', 'supplier_payment', 'salary_payment')),
    ADD CONSTRAINT ledger_entries_cash_shape
        CHECK (ledger_type <> 'cash' OR (bank_account_id IS NULL AND supplier_id IS NULL AND employee_id IS NULL)),
    ADD CONSTRAINT ledger_entries_bank_shape
        CHECK (ledger_type <> 'bank' OR (bank_account_id IS NOT NULL AND supplier_id IS NULL AND employee_id IS NULL)),
    ADD CONSTRAINT ledger_entries_supplier_shape
        CHECK (ledger_type <> 'supplier' OR (supplier_id IS NOT NULL AND bank_account_id IS NULL AND payment_id IS NULL AND employee_id IS NULL)),
    ADD CONSTRAINT ledger_entries_salary_shape
        CHECK (ledger_type <> 'salary' OR (employee_id IS NOT NULL AND bank_account_id IS NULL AND supplier_id IS NULL AND payment_id IS NULL)),
    -- only a supplier entry points at a purchase; supplier and salary
    -- payments say how they were paid
    ADD CONSTRAINT ledger_entries_stock_link_check
        CHECK (ledger_type = 'supplier' OR stock_in_id IS NULL),
    ADD CONSTRAINT ledger_entries_payment_type_owner_check
        CHECK (ledger_type IN ('supplier', 'salary') OR payment_type IS NULL),
    ADD CONSTRAINT ledger_entries_supplier_payment_shape
        CHECK (source NOT IN ('supplier_payment', 'salary_payment') OR (ledger_type IN ('cash', 'bank') AND entry_type = 'dr')),
    ADD CONSTRAINT ledger_entries_paired_shape
        CHECK ((source IN ('supplier_payment', 'salary_payment')) = (paired_entry_id IS NOT NULL));

COMMIT;
