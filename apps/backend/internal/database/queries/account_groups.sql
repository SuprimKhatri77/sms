-- Sub-groups don't store a primary head; they inherit their root group's.
-- The recursive CTE carries each root's head down the tree so every row comes
-- back with the head that actually applies to it.
-- name: ListAccountGroups :many
WITH RECURSIVE tree AS (
    SELECT ag.id, ag.primary_head_id AS root_primary_head_id
    FROM account_groups ag
    WHERE ag.parent_id IS NULL
    UNION
    SELECT c.id, t.root_primary_head_id
    FROM account_groups c
    JOIN tree t ON c.parent_id = t.id
)
SELECT
    g.id,
    g.parent_id,
    g.primary_head_id,
    g.name,
    g.code,
    g.description,
    g.created_at,
    ph.id AS effective_primary_head_id,
    ph.name AS effective_primary_head_name
FROM account_groups g
LEFT JOIN tree t ON t.id = g.id
LEFT JOIN primary_heads ph ON ph.id = t.root_primary_head_id
ORDER BY LOWER(g.name) ASC;

-- name: CreateAccountGroup :one
INSERT INTO account_groups (parent_id, primary_head_id, name, code, description)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateAccountGroup :one
UPDATE account_groups
SET parent_id = $2, primary_head_id = $3, name = $4, code = $5, description = $6
WHERE id = $1
RETURNING *;

-- name: DeleteAccountGroup :execresult
DELETE FROM account_groups WHERE id = $1;

-- Serialises every structural change to the group tree for the rest of the
-- transaction, so two concurrent moves can't each pass the cycle check and
-- together form a loop.
-- name: LockAccountGroupTree :exec
SELECT pg_advisory_xact_lock(hashtext('account_groups_tree'));

-- Walks up from the proposed parent; if the group being moved shows up among
-- those ancestors, the move would create a cycle. UNION (not UNION ALL) stops
-- the walk even if the data somehow already contains a loop.
-- name: IsAccountGroupInSubtree :one
WITH RECURSIVE ancestors AS (
    SELECT ag.id, ag.parent_id FROM account_groups ag WHERE ag.id = sqlc.arg(parent_id)::UUID
    UNION
    SELECT g.id, g.parent_id FROM account_groups g
    JOIN ancestors a ON g.id = a.parent_id
)
SELECT EXISTS (SELECT 1 FROM ancestors WHERE ancestors.id = sqlc.arg(group_id)::UUID);

-- name: GetAccountGroupByID :one
SELECT * FROM account_groups WHERE id = $1;
