BEGIN;

ALTER TABLE ledger_entries DROP CONSTRAINT ledger_entries_payment_type_check;
ALTER TABLE ledger_entries ADD CONSTRAINT ledger_entries_payment_type_check
    CHECK (payment_type IS NULL OR btrim(payment_type) <> '');

-- Put back the original free-text values from the copy 000054 kept, for the
-- rows the up step changed and that still hold what it set. Once that copy
-- is dropped the mapped values simply stay.
DO $$
BEGIN
    IF to_regclass('legacy_supplier_ledger_054') IS NOT NULL THEN
        UPDATE ledger_entries le
        SET payment_type = l.payment_type
        FROM legacy_supplier_ledger_054 l
        WHERE l.id = le.id
            AND btrim(l.payment_type) <> ''
            AND l.payment_type NOT IN ('cash', 'bank')
            AND le.payment_type = CASE WHEN lower(btrim(l.payment_type)) = 'cash' THEN 'cash' ELSE 'bank' END;
    END IF;
END $$;

COMMIT;
