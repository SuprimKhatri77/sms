-- name: IssueCertificate :one
INSERT INTO certificates (id, student_id, course_id, course_name, issued_by, remarks, type)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetStudentEnrolledCourseName :one
SELECT c.name
FROM student_courses sc
JOIN courses c ON c.id = sc.course_id
WHERE sc.student_id = $1
  AND sc.course_id = $2;

-- name: ListStudentCertificates :many
SELECT
    id,
    type,
    course_id,
    course_name,
    remarks,
    issued_at
FROM certificates
WHERE student_id = $1
ORDER BY issued_at DESC;

-- name: GetCertificateDetails :one
SELECT
    c.id,
    c.type,
    c.remarks,
    c.issued_at,
    s.full_name,
    s.reference_no,
    COALESCE(c.course_name, '') AS course_names
FROM certificates c
JOIN students s ON s.id = c.student_id
WHERE c.id = $1;