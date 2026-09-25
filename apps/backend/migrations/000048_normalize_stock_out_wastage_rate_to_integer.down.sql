-- Intentionally a no-op: the up migration only brings drifted databases in
-- line with 000007 (INTEGER). The pre-up type differs per database (NUMERIC
-- on drifted ones, already INTEGER elsewhere), so there's no single inverse,
-- and converting back to NUMERIC would introduce drift where there was none.
SELECT 1;
