-- name: CreateInquiry :one
INSERT INTO inquiries (full_name, phone, email, message, source)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: ListInquiries :many
SELECT * FROM inquiries ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: GetInquiryByID :one
SELECT * FROM inquiries WHERE id = $1;

-- name: MarkInquiryRead :execresult
UPDATE inquiries SET is_read = TRUE WHERE id = $1;

-- name: DeleteInquiry :execresult
DELETE FROM inquiries WHERE id = $1;

-- name: CountUnreadInquiries :one
SELECT COUNT(*)::INTEGER AS count FROM inquiries WHERE is_read = FALSE;

-- name: CountReadInquiries :one
SELECT COUNT(*)::INTEGER AS count FROM inquiries WHERE is_read = TRUE;


-- name: GetInquiriesCount :one
SELECT COUNT(*)::INTEGER AS count FROM inquiries;