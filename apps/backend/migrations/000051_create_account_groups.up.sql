-- Account groups form their own tree via parent_id. Only a root group may
-- link to a primary head; sub-groups inherit their root's head, which the
-- head_only_on_root check enforces so the tree can never disagree with itself.
CREATE TABLE account_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID CONSTRAINT account_groups_parent_id_fkey REFERENCES account_groups(id) ON DELETE RESTRICT,
    primary_head_id UUID CONSTRAINT account_groups_primary_head_id_fkey REFERENCES primary_heads(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT account_groups_not_own_parent CHECK (parent_id IS NULL OR parent_id <> id),
    CONSTRAINT account_groups_head_only_on_root CHECK (parent_id IS NULL OR primary_head_id IS NULL)
);

CREATE UNIQUE INDEX account_groups_name_key ON account_groups (LOWER(name));
CREATE UNIQUE INDEX account_groups_code_key ON account_groups (LOWER(code)) WHERE code IS NOT NULL;
CREATE INDEX idx_account_groups_parent_id ON account_groups(parent_id);
CREATE INDEX idx_account_groups_primary_head_id ON account_groups(primary_head_id);
