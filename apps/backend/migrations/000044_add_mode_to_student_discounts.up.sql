ALTER TABLE student_discounts
    ADD COLUMN mode TEXT NOT NULL DEFAULT 'percent'
    CHECK (mode IN ('percent', 'amount'));
