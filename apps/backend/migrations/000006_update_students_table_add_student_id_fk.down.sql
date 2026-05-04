DROP INDEX IF EXISTS idx_students_student_id;

ALTER TABLE students
DROP COLUMN student_id;

ALTER TABLE students
ADD COLUMN email VARCHAR NOT NULL DEFAULT '';