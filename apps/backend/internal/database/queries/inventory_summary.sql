-- name: GetInventorySummary :many
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.unit AS product_unit,

    COALESCE(si.total_qty, 0)::NUMERIC(14,3) AS stock_in_qty,
    COALESCE(so.total_qty, 0)::NUMERIC(14,3) AS stock_out_qty,
    COALESCE(w.total_qty, 0)::NUMERIC(14,3) AS wastage_qty,

    (COALESCE(si.total_qty, 0) - COALESCE(so.total_qty, 0) - COALESCE(w.total_qty, 0))::NUMERIC(14,3) AS closing_qty,

    COALESCE(si.total_amount, 0)::NUMERIC(14,2) AS stock_in_amount,
    COALESCE(so.total_amount, 0)::NUMERIC(14,2) AS stock_out_amount,
    COALESCE(w.total_amount, 0)::NUMERIC(14,2) AS wastage_amount,

    (COALESCE(si.total_amount, 0) - COALESCE(so.total_amount, 0) - COALESCE(w.total_amount, 0))::NUMERIC(14,2) AS closing_amount

FROM products p
LEFT JOIN (
    SELECT product_id,
           SUM(qty) AS total_qty,
           SUM(ROUND(qty * rate)) AS total_amount
    FROM stock_in
    WHERE
        (sqlc.narg('from')::TEXT IS NULL OR date >= sqlc.narg('from')::TEXT)
        AND (sqlc.narg('to')::TEXT IS NULL OR date <= sqlc.narg('to')::TEXT)
    GROUP BY product_id
) si ON si.product_id = p.id
LEFT JOIN (
    SELECT product_id,
           SUM(qty) AS total_qty,
           SUM(ROUND(qty * rate)) AS total_amount
    FROM stock_out
    WHERE
        (sqlc.narg('from')::TEXT IS NULL OR date >= sqlc.narg('from')::TEXT)
        AND (sqlc.narg('to')::TEXT IS NULL OR date <= sqlc.narg('to')::TEXT)
    GROUP BY product_id
) so ON so.product_id = p.id
LEFT JOIN (
    SELECT product_id,
           SUM(qty) AS total_qty,
           SUM(ROUND(qty * rate)) AS total_amount
    FROM wastage
    WHERE
        (sqlc.narg('from')::TEXT IS NULL OR date >= sqlc.narg('from')::TEXT)
        AND (sqlc.narg('to')::TEXT IS NULL OR date <= sqlc.narg('to')::TEXT)
    GROUP BY product_id
) w ON w.product_id = p.id
ORDER BY p.name ASC;

-- name: GetInventorySummaryByDateRange :many
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.unit AS product_unit,

    COALESCE(SUM(si.qty), 0)::NUMERIC(14,3)                      AS stock_in_qty,
    COALESCE(SUM(so.qty), 0)::NUMERIC(14,3)                      AS stock_out_qty,
    COALESCE(SUM(w.qty), 0)::NUMERIC(14,3)                       AS wastage_qty,

    (
        COALESCE(SUM(si.qty), 0) -
        COALESCE(SUM(so.qty), 0) -
        COALESCE(SUM(w.qty), 0)
    )::NUMERIC(14,3)                                             AS closing_qty,

    COALESCE(SUM(ROUND(si.qty * si.rate)), 0)::NUMERIC(14,2)     AS stock_in_amount,
    COALESCE(SUM(ROUND(so.qty * so.rate)), 0)::NUMERIC(14,2)     AS stock_out_amount,
    COALESCE(SUM(ROUND(w.qty * w.rate)), 0)::NUMERIC(14,2)       AS wastage_amount,

    (
        COALESCE(SUM(ROUND(si.qty * si.rate)), 0) -
        COALESCE(SUM(ROUND(so.qty * so.rate)), 0) -
        COALESCE(SUM(ROUND(w.qty * w.rate)), 0)
    )::NUMERIC(14,2)                                             AS closing_amount

FROM products p
LEFT JOIN stock_in si ON si.product_id = p.id AND si.date >= @from_date AND si.date <= @to_date
LEFT JOIN stock_out so ON so.product_id = p.id AND so.date >= @from_date AND so.date <= @to_date
LEFT JOIN wastage w ON w.product_id = p.id AND w.date >= @from_date AND w.date <= @to_date
GROUP BY p.id, p.name, p.unit
ORDER BY p.name ASC;

-- name: GetInventorySummaryByProduct :one
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.unit AS product_unit,

    COALESCE(SUM(si.qty), 0)::NUMERIC(14,3)                      AS stock_in_qty,
    COALESCE(SUM(so.qty), 0)::NUMERIC(14,3)                      AS stock_out_qty,
    COALESCE(SUM(w.qty), 0)::NUMERIC(14,3)                       AS wastage_qty,

    (
        COALESCE(SUM(si.qty), 0) -
        COALESCE(SUM(so.qty), 0) -
        COALESCE(SUM(w.qty), 0)
    )::NUMERIC(14,3)                                             AS closing_qty,

    COALESCE(SUM(ROUND(si.qty * si.rate)), 0)::NUMERIC(14,2)     AS stock_in_amount,
    COALESCE(SUM(ROUND(so.qty * so.rate)), 0)::NUMERIC(14,2)     AS stock_out_amount,
    COALESCE(SUM(ROUND(w.qty * w.rate)), 0)::NUMERIC(14,2)       AS wastage_amount,

    (
        COALESCE(SUM(ROUND(si.qty * si.rate)), 0) -
        COALESCE(SUM(ROUND(so.qty * so.rate)), 0) -
        COALESCE(SUM(ROUND(w.qty * w.rate)), 0)
    )::NUMERIC(14,2)                                             AS closing_amount

FROM products p
LEFT JOIN stock_in si ON si.product_id = p.id
LEFT JOIN stock_out so ON so.product_id = p.id
LEFT JOIN wastage w ON w.product_id = p.id
WHERE p.id = $1
GROUP BY p.id, p.name, p.unit;