-- name: GetStudentFeeSummary :one
SELECT
    COALESCE(SUM(c.fee), 0)::INTEGER AS total_fee,
    COALESCE((
        SELECT SUM(p.amount)
        FROM payments p
        WHERE p.student_id = $1
    ), 0)::INTEGER AS total_paid
FROM student_courses sc
JOIN courses c ON c.id = sc.course_id
WHERE sc.student_id = $1;


-- name: GetNextSerialNo :one
SELECT COALESCE(MAX(serial_no), 0) + 1 AS next_serial
FROM students 
WHERE fiscal_year = $1;

-- name: CreateStudent :one
INSERT INTO students (
    reference_no, fiscal_year, serial_no, full_name, dob, gender,
    phone, address, guardian_name, guardian_phone,
    photo_url, source, claimed_amount, status, student_id
) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10,
    $11, $12, $13, 'pending',$14
) RETURNING *;

-- name: GetStudentByID :one
SELECT 
    s.*,
    u.email
FROM students s
JOIN users u ON s.user_id = u.id
WHERE s.id = $1;

-- name: UpdateStudentStatus :one
UPDATE students SET status = $2
WHERE id = $1 RETURNING *;


-- name: ListStudents :many
SELECT 
    s.id,
    s.reference_no,
    s.full_name,
    s.phone,
    s.status,
    s.claimed_amount,
    s.created_at,
  COALESCE(
    STRING_AGG(c.name, ',' ORDER BY c.name),
    ''
) AS courses
FROM students s
LEFT JOIN student_courses sc ON sc.student_id = s.id
LEFT JOIN courses c ON c.id = sc.course_id
GROUP BY s.id
ORDER BY s.created_at DESC
LIMIT $1 OFFSET $2;


-- name: GetStudentsCount :one
SELECT COUNT(*) FROM students;