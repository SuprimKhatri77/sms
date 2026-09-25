-- stock_out.rate and wastage.rate are INTEGER paisa per 000007, but some
-- databases were built from an earlier draft of that migration where they
-- were NUMERIC(10,2). The app only ever writes whole paisa, so ROUND is
-- lossless; on databases that are already INTEGER this is effectively a no-op.
ALTER TABLE stock_out ALTER COLUMN rate TYPE INTEGER USING ROUND(rate)::INTEGER;
ALTER TABLE wastage ALTER COLUMN rate TYPE INTEGER USING ROUND(rate)::INTEGER;
