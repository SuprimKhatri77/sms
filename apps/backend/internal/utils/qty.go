package utils

import "math"

// RoundQty rounds an admin-entered inventory quantity to 3 decimal places,
// matching the NUMERIC(12,3) qty columns on stock_in / stock_out / wastage.
// JSON floats like 2.3 arrive as 2.2999999999999998; rounding here keeps the
// value we store (and compute amounts from) the one the admin actually typed.
func RoundQty(qty float64) float64 {
	return math.Round(qty*1000) / 1000
}

// LineAmount computes qty × rate for one inventory line in paisa, rounded to
// the nearest paisa (round-half-up), where qty is a 3-decimal quantity and
// ratePaisa is the stored per-unit rate in paisa.
//
// qty is first converted to exact integer thousandths (same idea as the
// basis-points step in PercentToAmount), so the rounding happens in integer
// arithmetic and matches Postgres' ROUND(qty * rate) used by the inventory
// summary — the supplier ledger and the summary never disagree by a paisa.
func LineAmount(qty float64, ratePaisa int32) int64 {
	qtyThousandths := int64(math.Round(qty * 1000))
	return (qtyThousandths*int64(ratePaisa) + 500) / 1000
}
