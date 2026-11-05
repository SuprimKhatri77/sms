-- name: CreateCourse :one
INSERT INTO courses (name, fee, is_active, slug)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetCoursesByIDs :many
SELECT id, fee, is_active
FROM courses
WHERE id = ANY($1::UUID[]);

-- name: GetCourseByID :one
SELECT * FROM courses WHERE id = $1;

-- name: GetCourseBySlug :one
SELECT * FROM courses WHERE name = $1;

-- name: ListCourses :many
SELECT * FROM courses ORDER BY created_at DESC;

-- name: ListActiveCourses :many
SELECT * FROM courses WHERE is_active = TRUE ORDER BY name ASC;

-- name: UpdateCourse :one
UPDATE courses SET name = $2, fee = $3, is_active = $4
WHERE id = $1 RETURNING *;

-- name: ToggleCourseActive :one
UPDATE courses SET is_active = $2
WHERE id = $1 RETURNING *;

-- name: DeleteCourse :execresult
DELETE FROM courses WHERE id = $1;

-- name: GetCoursesByStudentID :many
SELECT 
    c.*,
    sc.fee_at_enrollment
FROM courses c
JOIN student_courses sc ON sc.course_id = c.id
WHERE sc.student_id = $1;

-- name: EnrollStudentInCourse :exec
INSERT INTO student_courses (student_id, course_id, fee_at_enrollment)
VALUES ($1, $2, $3);

-- name: RemoveStudentFromCourse :exec
DELETE FROM student_courses
WHERE student_id = $1 AND course_id = $2;


-- name: GetStudentCourses :many
SELECT 
    c.name,
    sc.fee_at_enrollment,
    c.slug,
    c.id
FROM courses c
JOIN student_courses sc ON sc.course_id = c.id
WHERE sc.student_id = $1;

-- name: GetStudentCoursesCount :one
SELECT COUNT(*) FROM student_courses WHERE student_id = $1;