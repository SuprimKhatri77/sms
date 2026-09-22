-- name: GetStudentFeeSummary :one
SELECT
    s.status,
    COALESCE(sc.total_fee, 0)::BIGINT        AS total_fee,
    COALESCE(p.total_paid, 0)::BIGINT        AS total_paid,
    COALESCE(d.total_discount_percent, 0)::NUMERIC AS total_discount_percent,
    COALESCE(d.total_discount_amount, 0)::BIGINT   AS total_discount_amount,
    COALESCE(sch.percent, 0)::NUMERIC        AS scholarship_percent,
    COALESCE(sch.amount, 0)::BIGINT          AS scholarship_amount
FROM students s
LEFT JOIN (
    SELECT student_id, SUM(fee_at_enrollment) AS total_fee
    FROM student_courses
    GROUP BY student_id
) sc ON sc.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(amount) AS total_paid
    FROM payments
    GROUP BY student_id
) p ON p.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(percent) AS total_discount_percent, SUM(amount) AS total_discount_amount
    FROM student_discounts
    GROUP BY student_id
) d ON d.student_id = s.id
LEFT JOIN student_scholarships sch ON sch.student_id = s.id
WHERE s.id = $1;


-- name: GetNextSerialNo :one
SELECT COALESCE(MAX(serial_no), 0) + 1 AS next_serial
FROM students 
WHERE fiscal_year = $1;

-- name: CreateStudent :one
INSERT INTO students (
    reference_no, fiscal_year, serial_no, full_name, dob_ad, gender,
    phone, address, guardian_name, guardian_phone,
    photo_url, source, status, student_id,
    shift, shift_time, batch, dob_bs
) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10,
    $11, $12, 'pending', $13,
    $14, $15, $16, $17
) RETURNING *;

-- name: GetStudentByID :one
SELECT 
    s.*,
    u.email
FROM students s
JOIN users u ON s.student_id = u.id
WHERE s.id = $1;

-- name: UpdateStudentStatus :one
UPDATE students 
SET 
  status = $2,
  rejection_reason = $3,
  updated_at = NOW()
WHERE id = $1 
RETURNING *;


-- name: ListStudents :many
SELECT 
    s.id,
    s.reference_no,
    s.full_name,
    s.phone,
    s.status,
    s.created_at,
    s.batch,
    s.shift,
    COALESCE(
        STRING_AGG(c.name, ',' ORDER BY c.name),
        ''
    ) AS courses
FROM students s
LEFT JOIN student_courses sc ON sc.student_id = s.id
LEFT JOIN courses c ON c.id = sc.course_id
WHERE
    (@status::text = '' OR s.status = @status::text)
    AND (@shift::text = '' OR s.shift = @shift::text)
    AND (@batch::text = '' OR s.batch = @batch::text)
    AND (@course::text = '' OR c.name ILIKE @course::text)
    AND (
        @search::text = ''
        OR s.full_name ILIKE '%' || @search || '%'
        OR s.reference_no ILIKE '%' || @search || '%'
        OR s.phone ILIKE '%' || @search || '%'
    )
GROUP BY s.id
ORDER BY s.created_at DESC
LIMIT $1 OFFSET $2;

-- name: GetStudentsCount :one
SELECT COUNT(DISTINCT s.id)
FROM students s
LEFT JOIN student_courses sc ON sc.student_id = s.id
LEFT JOIN courses c ON c.id = sc.course_id
WHERE
    (@status::text = '' OR s.status = @status::text)
    AND (@shift::text = '' OR s.shift = @shift::text)
    AND (@batch::text = '' OR s.batch = @batch::text)
    AND (@course::text = '' OR c.name ILIKE @course::text)
    AND (
        @search::text = ''
        OR s.full_name ILIKE '%' || @search || '%'
        OR s.reference_no ILIKE '%' || @search || '%'
        OR s.phone ILIKE '%' || @search || '%'
    );



-- name: GetStudentsWithOutstandingFees :many
SELECT
    u.id AS user_id,
    s.id AS student_id,
    u.name,
    u.email,
    COALESCE(fees.total_fee, 0)::BIGINT AS total_course_fee,
    COALESCE(pays.total_paid, 0)::BIGINT AS total_paid,
    COALESCE(discounts.total_discount, 0)::BIGINT AS total_discount,
    COALESCE(scholarships.total_scholarship, 0)::BIGINT AS total_scholarship,
    (
        COALESCE(fees.total_fee, 0)
        - COALESCE(pays.total_paid, 0)
        - COALESCE(discounts.total_discount, 0)
        - COALESCE(scholarships.total_scholarship, 0)
    )::BIGINT AS outstanding
FROM users u
JOIN students s ON s.student_id = u.id
JOIN (
    SELECT student_id, SUM(fee_at_enrollment) AS total_fee
    FROM student_courses
    GROUP BY student_id
) fees ON fees.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(amount) AS total_paid
    FROM payments
    GROUP BY student_id
) pays ON pays.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(amount) AS total_discount
    FROM student_discounts
    GROUP BY student_id
) discounts ON discounts.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(amount) AS total_scholarship
    FROM student_scholarships
    GROUP BY student_id
) scholarships ON scholarships.student_id = s.id
WHERE s.status IN ('active', 'completed')
  AND (
        COALESCE(fees.total_fee, 0)
        - COALESCE(pays.total_paid, 0)
        - COALESCE(discounts.total_discount, 0)
        - COALESCE(scholarships.total_scholarship, 0)
      ) > 0
  AND (sqlc.narg('from_date')::TEXT IS NULL OR s.created_at >= sqlc.narg('from_date')::TIMESTAMPTZ)
  AND (sqlc.narg('to_date')::TEXT IS NULL OR s.created_at <= (sqlc.narg('to_date')::TIMESTAMPTZ + INTERVAL '1 day'))
  AND (sqlc.narg('search')::TEXT IS NULL OR u.name ILIKE '%' || sqlc.narg('search')::TEXT || '%' OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%')
ORDER BY outstanding DESC
LIMIT $1 OFFSET $2;

-- name: GetOutstandingFeesCount :one
SELECT COUNT(*)::BIGINT AS total
FROM (
    SELECT s.id
    FROM users u
    JOIN students s ON s.student_id = u.id
    JOIN (
        SELECT student_id, SUM(fee_at_enrollment) AS total_fee
        FROM student_courses
        GROUP BY student_id
    ) fees ON fees.student_id = s.id
    LEFT JOIN (
        SELECT student_id, SUM(amount) AS total_paid
        FROM payments
        GROUP BY student_id
    ) pays ON pays.student_id = s.id
    LEFT JOIN (
        SELECT student_id, SUM(amount) AS total_discount
        FROM student_discounts
        GROUP BY student_id
    ) discounts ON discounts.student_id = s.id
    LEFT JOIN (
        SELECT student_id, SUM(amount) AS total_scholarship
        FROM student_scholarships
        GROUP BY student_id
    ) scholarships ON scholarships.student_id = s.id
    WHERE s.status IN ('active', 'completed')
      AND (
            COALESCE(fees.total_fee, 0)
            - COALESCE(pays.total_paid, 0)
            - COALESCE(discounts.total_discount, 0)
            - COALESCE(scholarships.total_scholarship, 0)
          ) > 0
      AND (sqlc.narg('from_date')::TEXT IS NULL OR s.created_at >= sqlc.narg('from_date')::TIMESTAMPTZ)
      AND (sqlc.narg('to_date')::TEXT IS NULL OR s.created_at <= (sqlc.narg('to_date')::TIMESTAMPTZ + INTERVAL '1 day'))
      AND (sqlc.narg('search')::TEXT IS NULL OR u.name ILIKE '%' || sqlc.narg('search')::TEXT || '%' OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%')
) sub;

-- name: GetOutstandingFeesTotal :one
SELECT COALESCE(SUM(outstanding), 0)::BIGINT AS grand_total_outstanding
FROM (
    SELECT
        COALESCE(fees.total_fee, 0)
        - COALESCE(pays.total_paid, 0)
        - COALESCE(discounts.total_discount, 0)
        - COALESCE(scholarships.total_scholarship, 0) AS outstanding
    FROM users u
    JOIN students s ON s.student_id = u.id
    JOIN (
        SELECT student_id, SUM(fee_at_enrollment) AS total_fee
        FROM student_courses
        GROUP BY student_id
    ) fees ON fees.student_id = s.id
    LEFT JOIN (
        SELECT student_id, SUM(amount) AS total_paid
        FROM payments
        GROUP BY student_id
    ) pays ON pays.student_id = s.id
    LEFT JOIN (
        SELECT student_id, SUM(amount) AS total_discount
        FROM student_discounts
        GROUP BY student_id
    ) discounts ON discounts.student_id = s.id
    LEFT JOIN (
        SELECT student_id, SUM(amount) AS total_scholarship
        FROM student_scholarships
        GROUP BY student_id
    ) scholarships ON scholarships.student_id = s.id
    WHERE s.status IN ('active', 'completed')
      AND (
            COALESCE(fees.total_fee, 0)
            - COALESCE(pays.total_paid, 0)
            - COALESCE(discounts.total_discount, 0)
            - COALESCE(scholarships.total_scholarship, 0)
          ) > 0
      AND (sqlc.narg('from_date')::TEXT IS NULL OR s.created_at >= sqlc.narg('from_date')::TIMESTAMPTZ)
      AND (sqlc.narg('to_date')::TEXT IS NULL OR s.created_at <= (sqlc.narg('to_date')::TIMESTAMPTZ + INTERVAL '1 day'))
      AND (sqlc.narg('search')::TEXT IS NULL OR u.name ILIKE '%' || sqlc.narg('search')::TEXT || '%' OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%')
) sub;

-- name: GetSalesRevenue :many
SELECT
    u.id AS user_id,
    s.id AS student_id,
    u.name,
    u.email,
    COALESCE(fees.total_fee, 0)::BIGINT AS total_course_fee,
    COALESCE(pays.total_paid, 0)::BIGINT AS total_paid,
    COALESCE(discounts.total_discount, 0)::BIGINT AS total_discount,
    COALESCE(scholarships.total_scholarship, 0)::BIGINT AS total_scholarship,
    (
        COALESCE(fees.total_fee, 0)
        - COALESCE(pays.total_paid, 0)
        - COALESCE(discounts.total_discount, 0)
        - COALESCE(scholarships.total_scholarship, 0)
    )::BIGINT AS outstanding
FROM users u
JOIN students s ON s.student_id = u.id
JOIN (
    SELECT student_id, SUM(fee_at_enrollment) AS total_fee
    FROM student_courses
    GROUP BY student_id
) fees ON fees.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(amount) AS total_paid
    FROM payments
    WHERE (sqlc.narg('from_date')::TEXT IS NULL OR COALESCE(date, added_at) >= sqlc.narg('from_date')::TIMESTAMPTZ)
      AND (sqlc.narg('to_date')::TEXT IS NULL OR COALESCE(date, added_at) <= (sqlc.narg('to_date')::TIMESTAMPTZ + INTERVAL '1 day'))
    GROUP BY student_id
) pays ON pays.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(amount) AS total_discount
    FROM student_discounts
    GROUP BY student_id
) discounts ON discounts.student_id = s.id
LEFT JOIN (
    SELECT student_id, SUM(amount) AS total_scholarship
    FROM student_scholarships
    GROUP BY student_id
) scholarships ON scholarships.student_id = s.id
WHERE s.status IN ('active', 'completed')
  AND (sqlc.narg('from_date')::TEXT IS NULL OR s.created_at >= sqlc.narg('from_date')::TIMESTAMPTZ)
  AND (sqlc.narg('to_date')::TEXT IS NULL OR s.created_at <= (sqlc.narg('to_date')::TIMESTAMPTZ + INTERVAL '1 day'))
  AND (sqlc.narg('search')::TEXT IS NULL OR u.name ILIKE '%' || sqlc.narg('search')::TEXT || '%' OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%')
ORDER BY total_paid DESC
LIMIT $1 OFFSET $2;

-- name: GetSalesRevenueTotal :one
SELECT COALESCE(SUM(fees.total_fee), 0)::BIGINT AS total_collected
FROM students s
JOIN users u ON u.id = s.student_id
JOIN (
    SELECT student_id, SUM(fee_at_enrollment) AS total_fee
    FROM student_courses
    GROUP BY student_id
) fees ON fees.student_id = s.id
WHERE s.status IN ('active', 'completed')
  AND (sqlc.narg('from_date')::TEXT IS NULL OR s.created_at >= sqlc.narg('from_date')::TIMESTAMPTZ)
  AND (sqlc.narg('to_date')::TEXT IS NULL OR s.created_at <= (sqlc.narg('to_date')::TIMESTAMPTZ + INTERVAL '1 day'))
  AND (sqlc.narg('search')::TEXT IS NULL OR u.name ILIKE '%' || sqlc.narg('search')::TEXT || '%' OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%');

-- name: GetSalesRevenueCount :one
SELECT COUNT(DISTINCT s.id)::BIGINT AS total
FROM students s
JOIN users u ON u.id = s.student_id
WHERE s.status IN ('active', 'completed')
  AND (sqlc.narg('from_date')::TEXT IS NULL OR s.created_at >= sqlc.narg('from_date')::TIMESTAMPTZ)
  AND (sqlc.narg('to_date')::TEXT IS NULL OR s.created_at <= (sqlc.narg('to_date')::TIMESTAMPTZ + INTERVAL '1 day'))
  AND (sqlc.narg('search')::TEXT IS NULL OR u.name ILIKE '%' || sqlc.narg('search')::TEXT || '%' OR u.email ILIKE '%' || sqlc.narg('search')::TEXT || '%');


-- name: GetStudentAdmissionStatus :one
SELECT
  full_name,
  created_at,
  status
FROM students
WHERE student_id = $1;



-- name: GetStudentOverview :one
SELECT
 s.id,
 s.full_name,
 s.reference_no,
 s.batch,
 s.created_at,
 s.phone,
 s.shift,
 s.shift_time,
 s.gender,
 s.guardian_name,
 s.guardian_phone,
 s.address,
 s.fiscal_year,
 s.dob_bs,
 s.photo_url,
 s.status
FROM students s WHERE s.student_id = $1;

-- name: GetStudentID :one
SELECT
id
FROM students WHERE student_id = $1;

-- name: UpdateStudentPersonalInfo :execresult
UPDATE students
SET
  full_name = $2,
  dob_ad = $3,
  shift = $4,
  shift_time = $5,
  batch = $6,
  phone = $7,
  address = $8,
  source = $9,
  gender = $10,
  dob_bs = $11,
  updated_at = NOW()
WHERE id = $1;

-- name: UpdateStudentGuardianInfo :execresult
UPDATE students
SET 
 guardian_name = $2,
 guardian_phone = $3,
 updated_at = NOW()
WHERE id = $1;

-- name: GetStudentStatusByUserID :one
SELECT status
FROM students
WHERE student_id = $1;

-- name: GetStudentPendingOverview :one
SELECT
    full_name,
    created_at AS submitted_at
FROM students
WHERE student_id = $1
  AND status = 'pending';

-- name: GetStudentRejectedOverview :one
SELECT
    full_name,
    rejection_reason,
    updated_at AS decided_at
FROM students
WHERE student_id = $1
  AND status = 'rejected';

 
-- name: GetDistinctBatches :many
SELECT DISTINCT batch FROM students WHERE batch IS NOT NULL ORDER BY batch;


-- name: UpdateStudentImage :execresult
UPDATE students SET photo_url = $2 WHERE id = $1;

-- name: GetStudentStatus :one
SELECT status FROM students WHERE id = $1;