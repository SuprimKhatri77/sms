-- name: CreateEmployee :one
INSERT INTO employees (
    full_name, phone, designation, address, pan_no, notes,
    monthly_salary, join_date, join_date_bs, status
)
VALUES (
    @full_name, @phone, @designation, @address, @pan_no, @notes,
    @monthly_salary, @join_date, @join_date_bs, @status
)
RETURNING *;

-- name: GetEmployeeByID :one
SELECT * FROM employees WHERE id = $1;

-- Search matches the name or the code, so "EMP-004" and "004" both find the
-- fourth employee.
-- name: ListEmployees :many
SELECT * FROM employees
WHERE
    (sqlc.narg('q')::TEXT IS NULL
        OR full_name ILIKE '%' || sqlc.narg('q')::TEXT || '%'
        OR code ILIKE '%' || sqlc.narg('q')::TEXT || '%')
    AND (sqlc.narg('status')::TEXT IS NULL OR status = sqlc.narg('status')::TEXT)
ORDER BY employee_no ASC
LIMIT sqlc.arg('limit')::INT OFFSET sqlc.arg('offset')::INT;

-- name: GetEmployeeCountFiltered :one
SELECT COUNT(*) FROM employees
WHERE
    (sqlc.narg('q')::TEXT IS NULL
        OR full_name ILIKE '%' || sqlc.narg('q')::TEXT || '%'
        OR code ILIKE '%' || sqlc.narg('q')::TEXT || '%')
    AND (sqlc.narg('status')::TEXT IS NULL OR status = sqlc.narg('status')::TEXT);

-- name: UpdateEmployee :one
UPDATE employees
SET full_name = @full_name,
    phone = @phone,
    designation = @designation,
    address = @address,
    pan_no = @pan_no,
    notes = @notes,
    monthly_salary = @monthly_salary,
    join_date = @join_date,
    join_date_bs = @join_date_bs,
    status = @status
WHERE id = @id
RETURNING *;

-- name: DeleteEmployee :execrows
DELETE FROM employees WHERE id = $1;
