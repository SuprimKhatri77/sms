-- name: GetInventorySummary :many
-- Per product over the optional [from, to] BS date range:
--   opening = everything dated before `from` (zero when there's no `from`)
--   movements = purchases, sales and wastage dated inside the range
--   closing = opening + purchases - sales - wastage
-- Values are at purchase cost (FIFO batches), so closing amount is the cost of
-- what's left on the shelf; sales amount stays the selling total. Amounts are
-- paisa.
WITH alloc_costs AS (
    SELECT
        si.product_id,
        CASE WHEN a.stock_out_id IS NOT NULL THEN 'sale' ELSE 'wastage' END AS kind,
        COALESCE(so.date, w.date) AS date,
        ROUND((a.lot_offset + a.qty) * si.rate) - ROUND(a.lot_offset * si.rate) AS cost
    FROM stock_allocations a
    JOIN stock_in si ON si.id = a.stock_in_id
    LEFT JOIN stock_out so ON so.id = a.stock_out_id
    LEFT JOIN wastage w ON w.id = a.wastage_id
),
moves AS (
    SELECT product_id, 'purchase' AS kind, date, qty, ROUND(qty * rate) AS amount FROM stock_in
    UNION ALL
    SELECT product_id, 'sale' AS kind, date, qty, ROUND(qty * rate) AS amount FROM stock_out
    UNION ALL
    SELECT product_id, 'wastage' AS kind, date, qty, 0 AS amount FROM wastage
),
move_totals AS (
    SELECT
        product_id,
        SUM(CASE WHEN kind = 'purchase' THEN qty ELSE -qty END)
            FILTER (WHERE date < sqlc.narg('from')::TEXT) AS opening_qty,
        SUM(amount)
            FILTER (WHERE kind = 'purchase' AND date < sqlc.narg('from')::TEXT) AS opening_purchase_amount,
        SUM(qty) FILTER (WHERE kind = 'purchase' AND in_range) AS stock_in_qty,
        SUM(amount) FILTER (WHERE kind = 'purchase' AND in_range) AS stock_in_amount,
        SUM(qty) FILTER (WHERE kind = 'sale' AND in_range) AS stock_out_qty,
        SUM(amount) FILTER (WHERE kind = 'sale' AND in_range) AS stock_out_amount,
        SUM(qty) FILTER (WHERE kind = 'wastage' AND in_range) AS wastage_qty
    FROM (
        SELECT moves.*,
            (sqlc.narg('from')::TEXT IS NULL OR date >= sqlc.narg('from')::TEXT)
            AND (sqlc.narg('to')::TEXT IS NULL OR date <= sqlc.narg('to')::TEXT) AS in_range
        FROM moves
    ) m
    GROUP BY product_id
),
cost_totals AS (
    SELECT
        product_id,
        SUM(cost) FILTER (WHERE date < sqlc.narg('from')::TEXT) AS opening_used_cost,
        SUM(cost) FILTER (WHERE kind = 'sale' AND in_range) AS stock_out_cost,
        SUM(cost) FILTER (WHERE kind = 'wastage' AND in_range) AS wastage_cost
    FROM (
        SELECT alloc_costs.*,
            (sqlc.narg('from')::TEXT IS NULL OR date >= sqlc.narg('from')::TEXT)
            AND (sqlc.narg('to')::TEXT IS NULL OR date <= sqlc.narg('to')::TEXT) AS in_range
        FROM alloc_costs
    ) c
    GROUP BY product_id
),
totals AS (
    SELECT
        p.id AS product_id,
        COALESCE(mt.opening_qty, 0) AS opening_qty,
        COALESCE(mt.opening_purchase_amount, 0) - COALESCE(ct.opening_used_cost, 0) AS opening_amount,
        COALESCE(mt.stock_in_qty, 0) AS stock_in_qty,
        COALESCE(mt.stock_in_amount, 0) AS stock_in_amount,
        COALESCE(mt.stock_out_qty, 0) AS stock_out_qty,
        COALESCE(mt.stock_out_amount, 0) AS stock_out_amount,
        COALESCE(ct.stock_out_cost, 0) AS stock_out_cost,
        COALESCE(mt.wastage_qty, 0) AS wastage_qty,
        COALESCE(ct.wastage_cost, 0) AS wastage_cost
    FROM products p
    LEFT JOIN move_totals mt ON mt.product_id = p.id
    LEFT JOIN cost_totals ct ON ct.product_id = p.id
)
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.unit AS product_unit,
    cp.path AS category_path,

    t.opening_qty::NUMERIC(14,3) AS opening_qty,
    t.stock_in_qty::NUMERIC(14,3) AS stock_in_qty,
    t.stock_out_qty::NUMERIC(14,3) AS stock_out_qty,
    t.wastage_qty::NUMERIC(14,3) AS wastage_qty,
    (t.opening_qty + t.stock_in_qty - t.stock_out_qty - t.wastage_qty)::NUMERIC(14,3) AS closing_qty,

    t.opening_amount::NUMERIC(14,2) AS opening_amount,
    t.stock_in_amount::NUMERIC(14,2) AS stock_in_amount,
    t.stock_out_amount::NUMERIC(14,2) AS stock_out_amount,
    t.stock_out_cost::NUMERIC(14,2) AS stock_out_cost,
    t.wastage_cost::NUMERIC(14,2) AS wastage_cost,
    (t.opening_amount + t.stock_in_amount - t.stock_out_cost - t.wastage_cost)::NUMERIC(14,2) AS closing_amount

FROM products p
JOIN totals t ON t.product_id = p.id
LEFT JOIN product_category_paths cp ON cp.category_id = p.category_id
ORDER BY p.name ASC;
