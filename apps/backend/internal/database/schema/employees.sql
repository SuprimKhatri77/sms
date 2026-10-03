-- Staff paid through the salary ledger. The code (EMP-001, ...) comes from an
-- identity that never reuses a number, and tells apart people with the same
-- name.
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
