-- Bring back wastage.rate as the average cost per unit it was allocated
-- (at least 1 paisa, as the old CHECK requires).
ALTER TABLE wastage ADD COLUMN rate INTEGER;

UPDATE wastage w
SET rate = GREATEST(1, ROUND(c.cost / w.qty))::INTEGER
FROM (
    SELECT a.wastage_id,
           SUM(ROUND((a.lot_offset + a.qty) * si.rate) - ROUND(a.lot_offset * si.rate)) AS cost
    FROM stock_allocations a
    JOIN stock_in si ON si.id = a.stock_in_id
    WHERE a.wastage_id IS NOT NULL
    GROUP BY a.wastage_id
) c
WHERE c.wastage_id = w.id;

UPDATE wastage SET rate = 1 WHERE rate IS NULL;

ALTER TABLE wastage ALTER COLUMN rate SET NOT NULL;
ALTER TABLE wastage ADD CONSTRAINT wastage_rate_check CHECK (rate > 0);

DROP TABLE IF EXISTS stock_allocations;
