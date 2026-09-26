-- Restores the original percent > 0 check. NOT VALID so amount-mode rows
-- saved with 0.00 in the meantime don't block the rollback; the check still
-- applies to every new or updated row.
ALTER TABLE student_discounts DROP CONSTRAINT student_discounts_percent_check;
ALTER TABLE student_discounts ADD CONSTRAINT student_discounts_percent_check
    CHECK (percent > 0 AND percent <= 100) NOT VALID;
