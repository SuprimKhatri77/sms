DROP INDEX IF EXISTS certificates_student_course_unique;
DROP INDEX IF EXISTS certificates_student_all_courses_unique;

ALTER TABLE certificates
    DROP COLUMN IF EXISTS course_name,
    DROP COLUMN IF EXISTS course_id;
