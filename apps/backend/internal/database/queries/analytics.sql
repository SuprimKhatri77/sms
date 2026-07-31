-- name: GetAnalyticsOverview :one
SELECT
    COUNT(DISTINCT s.id)::INTEGER AS total_students,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'pending')::INTEGER AS pending_approvals,
    (
        SELECT COALESCE(SUM(amount), 0)::BIGINT
        FROM payments p
        WHERE (sqlc.narg('from')::TEXT IS NULL OR p.added_at >= sqlc.narg('from')::TIMESTAMPTZ)
          AND (sqlc.narg('to')::TEXT IS NULL OR p.added_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
    ) AS total_revenue,
    (
        SELECT COALESCE(SUM(amount), 0)::BIGINT
        FROM student_discounts sd
        WHERE (sqlc.narg('from')::TEXT IS NULL OR sd.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
          AND (sqlc.narg('to')::TEXT IS NULL OR sd.created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
    ) AS total_discounts,
    (
        SELECT COALESCE(SUM(amount), 0)::BIGINT
        FROM student_scholarships ss
        WHERE (sqlc.narg('from')::TEXT IS NULL OR ss.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
          AND (sqlc.narg('to')::TEXT IS NULL OR ss.created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
    ) AS total_scholarships,
    COUNT(DISTINCT s.id) FILTER (
        WHERE s.status IN ('active', 'completed')
        AND (
            SELECT COALESCE(SUM(fee_at_enrollment), 0)
            FROM student_courses sc
            WHERE sc.student_id = s.id
        )
        - (
            SELECT COALESCE(SUM(p2.amount), 0)
            FROM payments p2
            WHERE p2.student_id = s.id
        )
        - (
            SELECT COALESCE(SUM(sd.amount), 0)
            FROM student_discounts sd
            WHERE sd.student_id = s.id
        )
        - (
            SELECT COALESCE(SUM(ss.amount), 0)
            FROM student_scholarships ss
            WHERE ss.student_id = s.id
        ) > 0
    )::INTEGER AS students_with_balance
FROM students s
WHERE (sqlc.narg('from')::TEXT IS NULL OR s.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
  AND (sqlc.narg('to')::TEXT IS NULL OR s.created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'));

-- name: GetMonthlyRevenue :many
SELECT
    TO_CHAR(DATE_TRUNC('month', p.added_at), 'Month') AS month,
    COALESCE(SUM(p.amount), 0)::INTEGER AS amount
FROM payments p
WHERE (sqlc.narg('from')::TEXT IS NULL OR p.added_at >= sqlc.narg('from')::TIMESTAMPTZ)
  AND (sqlc.narg('to')::TEXT IS NULL OR p.added_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
GROUP BY DATE_TRUNC('month', p.added_at)
ORDER BY DATE_TRUNC('month', p.added_at);

-- name: GetMonthlyAdmissions :many
SELECT
    TO_CHAR(DATE_TRUNC('month', s.created_at), 'Month') AS month,
    COUNT(*)::INTEGER AS count
FROM students s
WHERE (sqlc.narg('from')::TEXT IS NULL OR s.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
  AND (sqlc.narg('to')::TEXT IS NULL OR s.created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY DATE_TRUNC('month', s.created_at);

-- name: GetSourceBreakdown :many
SELECT
    source,
    COUNT(*)::INTEGER AS count
FROM students
WHERE (sqlc.narg('from')::TEXT IS NULL OR created_at >= sqlc.narg('from')::TIMESTAMPTZ)
  AND (sqlc.narg('to')::TEXT IS NULL OR created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
GROUP BY source
ORDER BY count DESC;

-- name: GetStatusBreakdown :one
SELECT
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER AS active,
    COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER AS rejected,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed
FROM students
WHERE (sqlc.narg('from')::TEXT IS NULL OR created_at >= sqlc.narg('from')::TIMESTAMPTZ)
  AND (sqlc.narg('to')::TEXT IS NULL OR created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'));

-- name: GetCoursePopularity :many
SELECT
    c.name AS course,
    COUNT(s.id)::INTEGER AS count
FROM courses c
LEFT JOIN student_courses sc ON sc.course_id = c.id
LEFT JOIN students s ON s.id = sc.student_id
    AND (sqlc.narg('from')::TEXT IS NULL OR s.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
    AND (sqlc.narg('to')::TEXT IS NULL OR s.created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
GROUP BY c.id, c.name
ORDER BY count DESC;

-- name: GetInquiryStats :one
SELECT
    COUNT(*)::INTEGER AS total,
    COUNT(*) FILTER (WHERE is_read = false)::INTEGER AS unread
FROM inquiries
WHERE (sqlc.narg('from')::TEXT IS NULL OR created_at >= sqlc.narg('from')::TIMESTAMPTZ)
  AND (sqlc.narg('to')::TEXT IS NULL OR created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'));

-- name: GetMonthlyInquiries :many
SELECT
    TO_CHAR(DATE_TRUNC('month', created_at), 'Month') AS month,
    COUNT(*)::INTEGER AS count
FROM inquiries
WHERE (sqlc.narg('from')::TEXT IS NULL OR created_at >= sqlc.narg('from')::TIMESTAMPTZ)
  AND (sqlc.narg('to')::TEXT IS NULL OR created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at);

-- name: GetRevenueStats :one
SELECT
    COALESCE(SUM(p.amount) FILTER (
        WHERE DATE_TRUNC('month', p.added_at) = DATE_TRUNC('month', NOW())
          AND (sqlc.narg('from')::TEXT IS NULL OR p.added_at >= sqlc.narg('from')::TIMESTAMPTZ)
          AND (sqlc.narg('to')::TEXT IS NULL OR p.added_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
    ), 0)::INTEGER AS this_month,
    COALESCE(SUM(p.amount) FILTER (
        WHERE DATE_TRUNC('month', p.added_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
          AND (sqlc.narg('from')::TEXT IS NULL OR p.added_at >= sqlc.narg('from')::TIMESTAMPTZ)
          AND (sqlc.narg('to')::TEXT IS NULL OR p.added_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
    ), 0)::INTEGER AS last_month,
    COALESCE((
        SELECT SUM(outstanding)
        FROM (
            SELECT
                COALESCE(fees.total_fee, 0)
                - COALESCE(pays.total_paid, 0)
                - COALESCE(discounts.total_discount, 0)
                - COALESCE(scholarships.total_scholarship, 0) AS outstanding
            FROM students s
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
              AND (sqlc.narg('from')::TEXT IS NULL OR s.created_at >= sqlc.narg('from')::TIMESTAMPTZ)
              AND (sqlc.narg('to')::TEXT IS NULL OR s.created_at < (sqlc.narg('to')::TIMESTAMPTZ + INTERVAL '1 day'))
              AND (
                    COALESCE(fees.total_fee, 0)
                    - COALESCE(pays.total_paid, 0)
                    - COALESCE(discounts.total_discount, 0)
                    - COALESCE(scholarships.total_scholarship, 0)
                  ) > 0
        ) AS balances
    ), 0)::INTEGER AS outstanding
FROM payments p;
