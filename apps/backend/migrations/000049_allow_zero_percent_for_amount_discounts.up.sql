-- A flat-amount discount stores the percent it represents of the balance,
-- rounded to NUMERIC(5,2). A small flat discount on a large balance (e.g.
-- Rs 3 on Rs 68,000 = 0.0044%) rounds to 0.00 and failed percent > 0, so the
-- insert errored. In amount mode the percent is informational only (money
-- math uses amount), so 0.00 is allowed there; percent mode still needs > 0.
ALTER TABLE student_discounts DROP CONSTRAINT student_discounts_percent_check;
ALTER TABLE student_discounts ADD CONSTRAINT student_discounts_percent_check
    CHECK (percent >= 0 AND percent <= 100 AND (mode = 'amount' OR percent > 0));
