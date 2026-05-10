ALTER TABLE students
ADD CONSTRAINT students_status_check
CHECK (status IN ('pending', 'active', 'completed', 'rejected'));