ALTER TABLE students
DROP COLUMN email;

ALTER TABLE students
ADD COLUMN student_id UUID NOT NULL UNIQUE;

CREATE INDEX idx_students_student_id ON students(student_id);