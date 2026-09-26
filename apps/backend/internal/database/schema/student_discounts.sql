CREATE TABLE student_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    added_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type TEXT NOT NULL,
    percent NUMERIC(5,2) NOT NULL,
    note TEXT,
    amount BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mode TEXT NOT NULL DEFAULT 'percent' CHECK (mode IN ('percent', 'amount')),
    -- amount-mode percent is informational and may round to 0.00
    CONSTRAINT student_discounts_percent_check
        CHECK (percent >= 0 AND percent <= 100 AND (mode = 'amount' OR percent > 0))
);
