-- name: GetAnalyticsOverview :one
SELECT
    COUNT(DISTINCT s.id)::INTEGER AS total_students,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'pending')::INTEGER AS pending_approvals,
    COALESCE(SUM(p.amount), 0)::INTEGER AS total_revenue,
    COUNT(DISTINCT s.id) FILTER (
    WHERE s.status IN ('accepted', 'completed')
    AND (
        SELECT COALESCE(SUM(p2.amount), 0)
        FROM payments p2
        WHERE p2.student_id = s.id
    ) < (
        SELECT COALESCE(SUM(c.fee), 0)
        FROM student_courses sc
        JOIN courses c ON c.id = sc.course_id
        WHERE sc.student_id = s.id
    )
)::INTEGER AS students_with_balance
FROM students s
LEFT JOIN payments p ON p.student_id = s.id;

-- name: GetMonthlyRevenue :many
SELECT
    TO_CHAR(DATE_TRUNC('month', p.added_at), 'Month') AS month,
    COALESCE(SUM(p.amount), 0)::INTEGER AS amount
FROM payments p
GROUP BY DATE_TRUNC('month', p.added_at)
ORDER BY DATE_TRUNC('month', p.added_at);

-- name: GetMonthlyAdmissions :many
SELECT
    TO_CHAR(DATE_TRUNC('month', s.created_at), 'Month') AS month,
    COUNT(*)::INTEGER AS count
FROM students s
GROUP BY DATE_TRUNC('month', s.created_at)
ORDER BY DATE_TRUNC('month', s.created_at);

-- name: GetSourceBreakdown :many
SELECT
    source,
    COUNT(*)::INTEGER AS count
FROM students
GROUP BY source
ORDER BY count DESC;

-- name: GetStatusBreakdown :one
SELECT
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER AS active,
    COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER AS rejected,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed
FROM students;

-- name: GetCoursePopularity :many
SELECT
    c.name AS course,
    COUNT(sc.student_id)::INTEGER AS count
FROM courses c
LEFT JOIN student_courses sc ON sc.course_id = c.id
GROUP BY c.id, c.name
ORDER BY count DESC;

-- name: GetInquiryStats :one
SELECT
    COUNT(*)::INTEGER AS total,
    COUNT(*) FILTER (WHERE is_read = false)::INTEGER AS unread
FROM inquiries;

-- name: GetMonthlyInquiries :many
SELECT
    TO_CHAR(DATE_TRUNC('month', created_at), 'Month') AS month,
    COUNT(*)::INTEGER AS count
FROM inquiries
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at);

-- name: GetRevenueStats :one
SELECT
    COALESCE(SUM(p.amount) FILTER (
        WHERE DATE_TRUNC('month', p.added_at) = DATE_TRUNC('month', NOW())
    ), 0)::INTEGER AS this_month,
    COALESCE(SUM(p.amount) FILTER (
        WHERE DATE_TRUNC('month', p.added_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    ), 0)::INTEGER AS last_month,
    COALESCE((
        SELECT SUM(total_fee - total_paid)
        FROM (
            SELECT
                s.id,
                COALESCE(SUM(c.fee), 0) AS total_fee,
                COALESCE((SELECT SUM(p2.amount) FROM payments p2 WHERE p2.student_id = s.id), 0) AS total_paid
            FROM students s
            LEFT JOIN student_courses sc ON sc.student_id = s.id
            LEFT JOIN courses c ON c.id = sc.course_id
            GROUP BY s.id
        ) AS balances
        WHERE total_fee > total_paid
    ), 0)::INTEGER AS outstanding
FROM payments p;