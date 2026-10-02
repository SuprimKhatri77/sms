-- name: ListPrimaryHeads :many
SELECT * FROM primary_heads
ORDER BY LOWER(name) ASC;

-- name: CreatePrimaryHead :one
INSERT INTO primary_heads (parent_id, name, code, description)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdatePrimaryHead :one
UPDATE primary_heads
SET parent_id = $2, name = $3, code = $4, description = $5
WHERE id = $1
RETURNING *;

-- name: DeletePrimaryHead :execresult
DELETE FROM primary_heads WHERE id = $1;

-- Serialises every structural change to the head tree for the rest of the
-- transaction, so two concurrent moves can't each pass the cycle check and
-- together form a loop.
-- name: LockPrimaryHeadTree :exec
SELECT pg_advisory_xact_lock(hashtext('primary_heads_tree'));

-- Walks up from the proposed parent; if the head being moved shows up among
-- those ancestors, the move would create a cycle. UNION (not UNION ALL) stops
-- the walk even if the data somehow already contains a loop.
-- name: IsPrimaryHeadInSubtree :one
WITH RECURSIVE ancestors AS (
    SELECT ph.id, ph.parent_id FROM primary_heads ph WHERE ph.id = sqlc.arg(parent_id)::UUID
    UNION
    SELECT p.id, p.parent_id FROM primary_heads p
    JOIN ancestors a ON p.id = a.parent_id
)
SELECT EXISTS (SELECT 1 FROM ancestors WHERE ancestors.id = sqlc.arg(head_id)::UUID);
