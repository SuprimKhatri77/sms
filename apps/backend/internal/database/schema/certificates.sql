CREATE TABLE certificates (
    id          TEXT PRIMARY KEY,
    student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id   UUID REFERENCES courses(id) ON DELETE RESTRICT,
    course_name VARCHAR,
    issued_by   UUID NOT NULL REFERENCES users(id),
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remarks     VARCHAR,
    type        TEXT NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'workshop'))
);

CREATE UNIQUE INDEX certificates_student_all_courses_unique
    ON certificates (student_id, type)
    WHERE course_id IS NULL;

CREATE UNIQUE INDEX certificates_student_course_unique
    ON certificates (student_id, type, course_id)
    WHERE course_id IS NOT NULL;
