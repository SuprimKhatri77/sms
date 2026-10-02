// Package stockfifo links sales and wastage to the purchase batches they use
// up, oldest batch first (FIFO).
//
// Every purchase (stock_in row) is a batch with its own rate, so buying 10 @
// 200 and later 20 @ 300 never blends into one price. A sale or wastage only
// names the product; this package decides which batches it came from, which
// also guarantees stock never goes below zero on any date.
package stockfifo

import "github.com/jackc/pgx/v5/pgtype"

// Consumer kinds, matching the "kind" column of ListStockConsumersForProduct.
const (
	KindSale    = "sale"
	KindWastage = "wastage"
)

// Lot is one purchase batch. Qty is in thousandths of a unit (the qty columns
// are NUMERIC(12,3)), so all the arithmetic here is exact.
type Lot struct {
	ID   pgtype.UUID
	Date string // BS "YYYY-MM-DD"; zero-padded, so string order is date order
	Qty  int64
}

// Consumer is a sale or wastage that takes stock out.
type Consumer struct {
	Kind   string
	ID     pgtype.UUID
	Date   string
	BillNo string
	Qty    int64
}

// Allocation says Qty of LotID went to the consumer. Offset is how much of
// the lot earlier consumers had already taken; cost uses it so a lot's
// allocation costs add up to exactly its purchase amount.
type Allocation struct {
	LotID    pgtype.UUID
	Consumer Consumer
	Qty      int64
	Offset   int64
}

// Shortfall is the first consumer that couldn't be filled. Available is what
// was in stock for it on its date.
type Shortfall struct {
	Consumer  Consumer
	Available int64
}

// Allocate fills consumers from lots, oldest lot first. Both slices must be
// sorted by (date, created_at, id), which is how the queries return them.
//
// A consumer can only use lots dated on or before its own date, and a lot
// dated the same day counts as already received. That makes backdated entries
// safe: a sale dated before the purchase that would cover it comes up short.
func Allocate(lots []Lot, consumers []Consumer) ([]Allocation, *Shortfall) {
	remaining := make([]int64, len(lots))
	for i, lot := range lots {
		remaining[i] = lot.Qty
	}

	var allocations []Allocation
	arrived := 0 // lots[:arrived] are dated on or before the current consumer
	head := 0    // oldest lot that still has stock left
	for _, c := range consumers {
		for arrived < len(lots) && lots[arrived].Date <= c.Date {
			arrived++
		}

		need := c.Qty
		for need > 0 && head < arrived {
			take := min(need, remaining[head])
			allocations = append(allocations, Allocation{
				LotID:    lots[head].ID,
				Consumer: c,
				Qty:      take,
				Offset:   lots[head].Qty - remaining[head],
			})
			remaining[head] -= take
			need -= take
			if remaining[head] == 0 {
				head++
			}
		}

		if need > 0 {
			return nil, &Shortfall{Consumer: c, Available: c.Qty - need}
		}
	}

	return allocations, nil
}
