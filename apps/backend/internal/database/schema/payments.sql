CREATE TABLE payments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount     INTEGER NOT NULL,
    added_by   UUID NOT NULL REFERENCES users(id),
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date       TIMESTAMPTZ NOT NULL,
    bs_date    TEXT NOT NULL,
    remarks    VARCHAR,
    payment_mode TEXT NOT NULL
);