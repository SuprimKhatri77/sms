-- name: CreateDiscount :one
INSERT INTO student_discounts (student_id, type, percent, note, amount, added_by, mode)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetDiscountByID :one
SELECT * FROM student_discounts
WHERE id = $1;

-- name: ListDiscountsByStudent :many
SELECT 
    sd.*,
    u.name AS added_by_name
FROM student_discounts sd
JOIN users u ON u.id = sd.added_by
WHERE sd.student_id = $1
ORDER BY sd.created_at DESC;

-- name: UpdateDiscount :one
UPDATE student_discounts
SET type = $2, percent = $3, note = $4, amount = $5, mode = $6
WHERE id = $1
RETURNING *;

-- name: DeleteDiscount :exec
DELETE FROM student_discounts
WHERE id = $1;

-- name: GetTotalDiscountPercentByStudent :one
SELECT COALESCE(SUM(percent), 0)::NUMERIC AS total_discount_percent
FROM student_discounts
WHERE student_id = $1;


-- name: GetStudentDiscounts :many
SELECT 
id,
note,
type,
percent,
amount,
created_at
FROM student_discounts
WHERE student_id = $1;


-- name: GetAllStudentDiscounts :many
SELECT
    s.id AS student_id,
    s.reference_no,
    s.full_name,
    s.photo_url,
    u.email,
    s.phone,
    sd.id AS discount_id,
    sd.amount,
    sd.percent,
    sd.type,
    sd.note,
    sd.created_at
FROM students s
JOIN users u ON u.id = s.student_id
JOIN student_discounts sd ON sd.student_id = s.id
WHERE
    (sqlc.narg('search')::TEXT IS NULL
        OR s.full_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.phone ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.reference_no ILIKE '%' || sqlc.narg('search')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR sd.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
    AND (sqlc.narg('to')::TEXT IS NULL OR sd.created_at <= (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
ORDER BY sd.created_at DESC
LIMIT $1 OFFSET $2;

-- name: GetAllStudentDiscountsCount :one
SELECT COUNT(*)::BIGINT
FROM students s
JOIN users u ON u.id = s.student_id
JOIN student_discounts sd ON sd.student_id = s.id
WHERE
    (sqlc.narg('search')::TEXT IS NULL
        OR s.full_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.phone ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.reference_no ILIKE '%' || sqlc.narg('search')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR sd.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
    AND (sqlc.narg('to')::TEXT IS NULL OR sd.created_at <= (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'));

-- name: GetAllStudentDiscountsTotal :one
SELECT COALESCE(SUM(sd.amount), 0)::BIGINT AS total_discounts
FROM students s
JOIN users u ON u.id = s.student_id
JOIN student_discounts sd ON sd.student_id = s.id
WHERE
    (sqlc.narg('search')::TEXT IS NULL
        OR s.full_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.phone ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.reference_no ILIKE '%' || sqlc.narg('search')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR sd.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
    AND (sqlc.narg('to')::TEXT IS NULL OR sd.created_at <= (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'));

