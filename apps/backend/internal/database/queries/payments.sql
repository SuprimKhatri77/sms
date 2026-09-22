-- name: AddPayment :one
INSERT INTO payments (student_id, amount, added_by, remarks, payment_mode, date, bs_date)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetPaymentsByStudent :many
SELECT
    p.id,
    p.student_id,
    p.amount,
    p.added_by,
    p.added_at,
    COALESCE(p.date, p.added_at)::TIMESTAMPTZ AS date,
    p.bs_date,
    p.remarks,
    p.payment_mode,
    a.name AS added_by_name
FROM payments p
JOIN users a ON a.id = p.added_by
WHERE p.student_id = $1
ORDER BY COALESCE(p.date, p.added_at) ASC;

-- name: GetTotalPaidByStudent :one
SELECT COALESCE(SUM(amount), 0)::INTEGER AS total_paid
FROM payments
WHERE student_id = $1;

-- name: DeletePayment :exec
DELETE FROM payments WHERE id = $1;

-- name: GetStudentPayments :many
SELECT
p.id,
p.amount,
p.payment_mode,
p.remarks,
p.added_at,
COALESCE(p.date, p.added_at)::TIMESTAMPTZ AS date,
p.bs_date
FROM payments p WHERE p.student_id = $1 ORDER BY COALESCE(p.date, p.added_at) ASC;


-- name: GetAllPayments :many
SELECT
    s.id AS student_id,
    s.reference_no,
    s.full_name,
    s.photo_url,
    u.email,
    s.phone,
    p.id AS payment_id,
    p.amount,
    p.payment_mode,
    p.remarks,
    p.added_by,
    p.added_at,
    COALESCE(p.date, p.added_at)::TIMESTAMPTZ AS date,
    p.bs_date
FROM students s
JOIN users u ON u.id = s.student_id
JOIN payments p ON p.student_id = s.id
WHERE
    (sqlc.narg('search')::TEXT IS NULL
        OR s.full_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.phone ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.reference_no ILIKE '%' || sqlc.narg('search')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR COALESCE(p.date, p.added_at) >= sqlc.narg('from')::TIMESTAMPTZ)
    AND (sqlc.narg('to')::TEXT IS NULL OR COALESCE(p.date, p.added_at) <= (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
ORDER BY COALESCE(p.date, p.added_at) DESC, p.id DESC
LIMIT $1 OFFSET $2;

-- name: GetAllPaymentsCount :one
SELECT COUNT(*)::BIGINT
FROM students s
JOIN users u ON u.id = s.student_id
JOIN payments p ON p.student_id = s.id
WHERE
    (sqlc.narg('search')::TEXT IS NULL
        OR s.full_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.phone ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.reference_no ILIKE '%' || sqlc.narg('search')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR COALESCE(p.date, p.added_at) >= sqlc.narg('from')::TIMESTAMPTZ)
    AND (sqlc.narg('to')::TEXT IS NULL OR COALESCE(p.date, p.added_at) <= (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'));

-- name: GetAllPaymentsTotal :one
SELECT COALESCE(SUM(p.amount), 0)::BIGINT AS total_payments
FROM students s
JOIN users u ON u.id = s.student_id
JOIN payments p ON p.student_id = s.id
WHERE
    (sqlc.narg('search')::TEXT IS NULL
        OR s.full_name ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.phone ILIKE '%' || sqlc.narg('search')::TEXT || '%'
        OR s.reference_no ILIKE '%' || sqlc.narg('search')::TEXT || '%')
    AND (sqlc.narg('from')::TEXT IS NULL OR COALESCE(p.date, p.added_at) >= sqlc.narg('from')::TIMESTAMPTZ)
    AND (sqlc.narg('to')::TEXT IS NULL OR COALESCE(p.date, p.added_at) <= (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'));