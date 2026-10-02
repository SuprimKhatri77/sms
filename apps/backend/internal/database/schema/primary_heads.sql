CREATE TABLE primary_heads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID CONSTRAINT primary_heads_parent_id_fkey REFERENCES primary_heads(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT primary_heads_not_own_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE UNIQUE INDEX primary_heads_name_key ON primary_heads (LOWER(name));
CREATE UNIQUE INDEX primary_heads_code_key ON primary_heads (LOWER(code)) WHERE code IS NOT NULL;
CREATE INDEX idx_primary_heads_parent_id ON primary_heads(parent_id);
