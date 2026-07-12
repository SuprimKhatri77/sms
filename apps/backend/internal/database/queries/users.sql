-- name: CreateUser :one
INSERT INTO users (name, email, password_hash, role)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: Listusers :many
SELECT id, name, email, role, created_at FROM users
ORDER BY created_at DESC;

-- name: UpdateUser :one
UPDATE users SET name = $2, role = $3
WHERE id = $1 RETURNING *;

-- name: UpdateUserPassword :one
UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING *;

-- name: UpdateUserProfile :one
UPDATE users SET name = $2, image_url = $3 WHERE id = $1 RETURNING *;

-- name: UpdateUserImage :exec
UPDATE users SET image_url = $2 WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;


-- name: GetPaginatedUsers :many
SELECT 
    id, 
    name, 
    email, 
    role,
    created_at,
    image_url 
FROM users 
WHERE 
    role IN ('student', 'admin', 'instructor')
    AND (sqlc.narg('role')::text IS NULL OR role = sqlc.narg('role')::text)
    AND (sqlc.narg('search')::text IS NULL OR name ILIKE '%' || sqlc.narg('search')::text || '%' OR email ILIKE '%' || sqlc.narg('search')::text || '%')
ORDER BY created_at DESC, id ASC
LIMIT $1 OFFSET $2;


-- name: GetUsersRoleCount :many
SELECT role, COUNT(*) as count
FROM users
WHERE role IN ('student', 'admin', 'instructor')
GROUP BY role;


