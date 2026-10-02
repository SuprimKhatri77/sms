-- Every purchase (stock_in row) is a batch with its own rate. A sale or
-- wastage records which batches it used up, oldest first (FIFO), so stock can
-- never go below zero and cost comes from what was actually paid.
CREATE TABLE stock_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- RESTRICT: a purchase whose units are used can't disappear silently; the
    -- handlers clear and rebuild a product's allocations on purpose.
    stock_in_id UUID NOT NULL CONSTRAINT stock_allocations_stock_in_id_fkey
        REFERENCES stock_in(id) ON DELETE RESTRICT,
    stock_out_id UUID CONSTRAINT stock_allocations_stock_out_id_fkey
        REFERENCES stock_out(id) ON DELETE CASCADE,
    wastage_id UUID CONSTRAINT stock_allocations_wastage_id_fkey
        REFERENCES wastage(id) ON DELETE CASCADE,
    qty NUMERIC(12,3) NOT NULL CHECK (qty > 0),
    -- how much of the batch earlier consumers already used. Cost is
    -- ROUND((lot_offset + qty) * rate) - ROUND(lot_offset * rate), so the
    -- costs of a batch's allocations add up to exactly its purchase amount.
    lot_offset NUMERIC(12,3) NOT NULL CHECK (lot_offset >= 0),
    CONSTRAINT stock_allocations_one_consumer CHECK (num_nonnulls(stock_out_id, wastage_id) = 1)
);

CREATE INDEX idx_stock_allocations_stock_in_id ON stock_allocations(stock_in_id);
CREATE INDEX idx_stock_allocations_stock_out_id ON stock_allocations(stock_out_id);
CREATE INDEX idx_stock_allocations_wastage_id ON stock_allocations(wastage_id);

-- Allocate existing sales and wastage. FIFO is the overlap of cumulative
-- quantity ranges: batches and consumers are each lined up per product in
-- (date, created_at, id) order, the same order the app uses. For a history
-- that never ran short this matches the app exactly; one that already ran
-- short just leaves the excess unallocated.
WITH lots AS (
    SELECT id, product_id,
           SUM(qty) OVER w - qty AS lo,
           SUM(qty) OVER w AS hi
    FROM stock_in
    WINDOW w AS (PARTITION BY product_id ORDER BY date, created_at, id)
),
consumers AS (
    SELECT kind, id, product_id,
           SUM(qty) OVER w - qty AS lo,
           SUM(qty) OVER w AS hi
    FROM (
        SELECT 'sale' AS kind, id, product_id, date, created_at, qty FROM stock_out
        UNION ALL
        SELECT 'wastage' AS kind, id, product_id, date, created_at, qty FROM wastage
    ) c
    WINDOW w AS (PARTITION BY product_id ORDER BY date, created_at, id)
)
INSERT INTO stock_allocations (stock_in_id, stock_out_id, wastage_id, qty, lot_offset)
SELECT l.id,
       CASE WHEN c.kind = 'sale' THEN c.id END,
       CASE WHEN c.kind = 'wastage' THEN c.id END,
       LEAST(l.hi, c.hi) - GREATEST(l.lo, c.lo),
       GREATEST(l.lo, c.lo) - l.lo
FROM lots l
JOIN consumers c ON c.product_id = l.product_id AND c.lo < l.hi AND l.lo < c.hi;

-- Wastage is now valued at the cost of the batches it used, not a typed rate.
ALTER TABLE wastage DROP COLUMN rate;
