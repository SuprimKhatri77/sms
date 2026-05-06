-- name: GetInventorySummary :many
-- Full summary per product:
-- stock_in_qty, stock_out_qty, wastage_qty, closing_qty
-- stock_in_amount, stock_out_amount, wastage_amount, closing_amount
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.unit AS product_unit,

    COALESCE(SUM(si.qty), 0)::INTEGER                           AS stock_in_qty,
    COALESCE(SUM(so.qty), 0)::INTEGER                           AS stock_out_qty,
    COALESCE(SUM(w.qty), 0)::INTEGER                            AS wastage_qty,

    (
        COALESCE(SUM(si.qty), 0) -
        COALESCE(SUM(so.qty), 0) -
        COALESCE(SUM(w.qty), 0)
    )::INTEGER                                                   AS closing_qty,

    COALESCE(SUM(si.qty * si.rate), 0)::NUMERIC(14,2)           AS stock_in_amount,
    COALESCE(SUM(so.qty * so.rate), 0)::NUMERIC(14,2)           AS stock_out_amount,
    COALESCE(SUM(w.qty * w.rate), 0)::NUMERIC(14,2)             AS wastage_amount,

    (
        COALESCE(SUM(si.qty * si.rate), 0) -
        COALESCE(SUM(so.qty * so.rate), 0) -
        COALESCE(SUM(w.qty * w.rate), 0)
    )::NUMERIC(14,2)                                             AS closing_amount

FROM products p
LEFT JOIN stock_in si ON si.product_id = p.id
LEFT JOIN stock_out so ON so.product_id = p.id
LEFT JOIN wastage w ON w.product_id = p.id
GROUP BY p.id, p.name, p.unit
ORDER BY p.name ASC;

-- name: GetInventorySummaryByDateRange :many
-- Same summary but filtered to a BS date range across all three tables
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.unit AS product_unit,

    COALESCE(SUM(si.qty), 0)::INTEGER                           AS stock_in_qty,
    COALESCE(SUM(so.qty), 0)::INTEGER                           AS stock_out_qty,
    COALESCE(SUM(w.qty), 0)::INTEGER                            AS wastage_qty,

    (
        COALESCE(SUM(si.qty), 0) -
        COALESCE(SUM(so.qty), 0) -
        COALESCE(SUM(w.qty), 0)
    )::INTEGER                                                   AS closing_qty,

    COALESCE(SUM(si.qty * si.rate), 0)::NUMERIC(14,2)           AS stock_in_amount,
    COALESCE(SUM(so.qty * so.rate), 0)::NUMERIC(14,2)           AS stock_out_amount,
    COALESCE(SUM(w.qty * w.rate), 0)::NUMERIC(14,2)             AS wastage_amount,

    (
        COALESCE(SUM(si.qty * si.rate), 0) -
        COALESCE(SUM(so.qty * so.rate), 0) -
        COALESCE(SUM(w.qty * w.rate), 0)
    )::NUMERIC(14,2)                                             AS closing_amount

FROM products p
LEFT JOIN stock_in si ON si.product_id = p.id AND si.date >= @from_date AND si.date <= @to_date
LEFT JOIN stock_out so ON so.product_id = p.id AND so.date >= @from_date AND so.date <= @to_date
LEFT JOIN wastage w ON w.product_id = p.id AND w.date >= @from_date AND w.date <= @to_date
GROUP BY p.id, p.name, p.unit
ORDER BY p.name ASC;

-- name: GetInventorySummaryByProduct :one
-- Single product summary, all time
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.unit AS product_unit,

    COALESCE(SUM(si.qty), 0)::INTEGER                           AS stock_in_qty,
    COALESCE(SUM(so.qty), 0)::INTEGER                           AS stock_out_qty,
    COALESCE(SUM(w.qty), 0)::INTEGER                            AS wastage_qty,

    (
        COALESCE(SUM(si.qty), 0) -
        COALESCE(SUM(so.qty), 0) -
        COALESCE(SUM(w.qty), 0)
    )::INTEGER                                                   AS closing_qty,

    COALESCE(SUM(si.qty * si.rate), 0)::NUMERIC(14,2)           AS stock_in_amount,
    COALESCE(SUM(so.qty * so.rate), 0)::NUMERIC(14,2)           AS stock_out_amount,
    COALESCE(SUM(w.qty * w.rate), 0)::NUMERIC(14,2)             AS wastage_amount,

    (
        COALESCE(SUM(si.qty * si.rate), 0) -
        COALESCE(SUM(so.qty * so.rate), 0) -
        COALESCE(SUM(w.qty * w.rate), 0)
    )::NUMERIC(14,2)                                             AS closing_amount

FROM products p
LEFT JOIN stock_in si ON si.product_id = p.id
LEFT JOIN stock_out so ON so.product_id = p.id
LEFT JOIN wastage w ON w.product_id = p.id
WHERE p.id = $1
GROUP BY p.id, p.name, p.unit;