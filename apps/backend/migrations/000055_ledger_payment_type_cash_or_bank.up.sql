-- A supplier payment is either cash or bank. Earlier free-text values are
-- mapped the way their money was already booked: "cash" in any case to the
-- cash ledger, everything else (Bank, cheque, esewa, ...) to a bank account.
BEGIN;

UPDATE ledger_entries
SET payment_type = CASE WHEN lower(btrim(payment_type)) = 'cash' THEN 'cash' ELSE 'bank' END
WHERE payment_type IS NOT NULL
    AND payment_type NOT IN ('cash', 'bank');

ALTER TABLE ledger_entries DROP CONSTRAINT ledger_entries_payment_type_check;
ALTER TABLE ledger_entries ADD CONSTRAINT ledger_entries_payment_type_check
    CHECK (payment_type IS NULL OR payment_type IN ('cash', 'bank'));

COMMIT;
