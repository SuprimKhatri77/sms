-- which purchase batches each sale / wastage used up (FIFO)
CREATE TABLE stock_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
