package utils

import "math"

// PercentToAmount computes the amount (smallest currency unit, e.g. paisa)
// that `percent` of `base` (same unit) represents, rounded to the nearest
// whole unit (round-half-up) — never truncated. `percent` is expected to
// already satisfy 0 < percent <= 100 with at most 2 decimal places (same
// constraint as the NUMERIC(5,2) percent column); callers validate that via
// binding tags before calling this.
//
// float64 can't exactly represent most 2-decimal values (e.g. 2.55*100 is
// 254.99999999999997, not 255), so percent is first converted to integer
// "basis points" via math.Round (the float error is always far smaller than
// 0.5, so this recovers the intended exact integer). The final division is
// done with pure integer arithmetic — add half the denominator before
// dividing — to round half-up without any further float precision risk.
func PercentToAmount(base int64, percent float64) int64 {
	basisPoints := int64(math.Round(percent * 100))
	numerator := base * basisPoints
	return (numerator + 5000) / 10000
}

// AmountToPercent computes the percent `amount` represents of `base` (both
// same unit), rounded to 2 decimal places to match NUMERIC(5,2). Returns 0
// if base <= 0 (callers already guard remainingBalance <= 0 earlier, so
// this is just a defensive floor, not a path expected to be hit).
func AmountToPercent(base int64, amount int64) float64 {
	if base <= 0 {
		return 0
	}
	raw := float64(amount) / float64(base) * 100
	return math.Round(raw*100) / 100
}

// RupeesToPaisa converts an admin-entered Rupee amount into integer paisa,
// rounding to the nearest paisa. Truncating instead (int64(rupees*100))
// loses a paisa to float error, e.g. 19.99*100 = 1998.9999999999998.
func RupeesToPaisa(rupees float64) int64 {
	return int64(math.Round(rupees * 100))
}
