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
UPDATE users SET name = $2, email = $3, role = $4
WHERE id = $1 RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;


-- name: GetPaginatedUsers :many
SELECT * FROM users LIMIT $1 OFFSET $2;


-- name: GetUsersCount :one
SELECT COUNT(*) FROM users;


