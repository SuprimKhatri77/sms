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
