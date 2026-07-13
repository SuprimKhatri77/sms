ALTER TABLE certificates
    ADD COLUMN course_id UUID NULL REFERENCES courses(id) ON DELETE RESTRICT,
    ADD COLUMN course_name VARCHAR NULL;

CREATE UNIQUE INDEX certificates_student_all_courses_unique
    ON certificates (student_id, type)
    WHERE course_id IS NULL;

CREATE UNIQUE INDEX certificates_student_course_unique
    ON certificates (student_id, type, course_id)
    WHERE course_id IS NOT NULL;
