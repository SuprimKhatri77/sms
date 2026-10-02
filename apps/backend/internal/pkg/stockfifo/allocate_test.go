package stockfifo

import (
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
)

func id(n byte) pgtype.UUID {
	return pgtype.UUID{Bytes: [16]byte{n}, Valid: true}
}

func lot(n byte, date string, qty int64) Lot {
	return Lot{ID: id(n), Date: date, Qty: qty * 1000}
}

func sale(n byte, date string, qty int64) Consumer {
	return Consumer{Kind: KindSale, ID: id(n), Date: date, Qty: qty * 1000}
}

func wastage(n byte, date string, qty int64) Consumer {
	return Consumer{Kind: KindWastage, ID: id(n), Date: date, Qty: qty * 1000}
}

// got is the simplified form of an allocation the tests compare against:
// lot id -> consumer id, qty and offset in thousandths.
type got struct {
	lot, consumer byte
	qty, offset   int64
}

func simplify(allocs []Allocation) []got {
	out := make([]got, len(allocs))
	for i, a := range allocs {
		out[i] = got{a.LotID.Bytes[0], a.Consumer.ID.Bytes[0], a.Qty, a.Offset}
	}
	return out
}

func TestAllocate(t *testing.T) {
	tests := []struct {
		name      string
		lots      []Lot
		consumers []Consumer
		want      []got
		short     byte  // consumer id expected to fall short; 0 = none
		available int64 // thousandths available to the short consumer
	}{
		{
			name:      "nothing to allocate",
			lots:      []Lot{lot(1, "2083-01-01", 10)},
			consumers: nil,
			want:      []got{},
		},
		{
			name:      "exact fill from one lot",
			lots:      []Lot{lot(1, "2083-01-01", 10)},
			consumers: []Consumer{sale(11, "2083-01-02", 10)},
			want:      []got{{1, 11, 10000, 0}},
		},
		{
			name:      "oldest lot first, spills into the next",
			lots:      []Lot{lot(1, "2083-01-01", 10), lot(2, "2083-01-05", 20)},
			consumers: []Consumer{sale(11, "2083-01-06", 15)},
			want:      []got{{1, 11, 10000, 0}, {2, 11, 5000, 0}},
		},
		{
			name:      "later consumers continue where earlier ones stopped",
			lots:      []Lot{lot(1, "2083-01-01", 10)},
			consumers: []Consumer{sale(11, "2083-01-02", 4), wastage(12, "2083-01-03", 3)},
			want:      []got{{1, 11, 4000, 0}, {1, 12, 3000, 4000}},
		},
		{
			name:      "same-day purchase counts before the sale",
			lots:      []Lot{lot(1, "2083-01-05", 5)},
			consumers: []Consumer{sale(11, "2083-01-05", 5)},
			want:      []got{{1, 11, 5000, 0}},
		},
		{
			name:      "selling more than was bought",
			lots:      []Lot{lot(1, "2083-01-01", 10)},
			consumers: []Consumer{sale(11, "2083-01-02", 100)},
			short:     11,
			available: 10000,
		},
		{
			name:      "backdated sale can't use a later purchase",
			lots:      []Lot{lot(1, "2083-01-01", 10), lot(2, "2083-01-05", 20)},
			consumers: []Consumer{sale(11, "2083-01-03", 12)},
			short:     11,
			available: 10000,
		},
		{
			name:      "backdated sale that fits takes the old lot; the later sale moves on",
			lots:      []Lot{lot(1, "2083-01-01", 10), lot(2, "2083-01-05", 20)},
			consumers: []Consumer{sale(11, "2083-01-03", 10), sale(12, "2083-01-06", 15)},
			want:      []got{{1, 11, 10000, 0}, {2, 12, 15000, 0}},
		},
		{
			name:      "a later consumer comes up short once an earlier lot is gone",
			lots:      []Lot{lot(2, "2083-01-05", 20)},
			consumers: []Consumer{sale(11, "2083-01-06", 15), wastage(12, "2083-01-07", 10)},
			short:     12,
			available: 5000,
		},
		{
			name:      "nothing in stock yet",
			lots:      []Lot{lot(1, "2083-02-01", 10)},
			consumers: []Consumer{wastage(11, "2083-01-01", 1)},
			short:     11,
			available: 0,
		},
		{
			name: "fractional quantities stay exact",
			lots: []Lot{
				{ID: id(1), Date: "2083-01-01", Qty: 1},    // 0.001
				{ID: id(2), Date: "2083-01-01", Qty: 2500}, // 2.5
			},
			consumers: []Consumer{{Kind: KindSale, ID: id(11), Date: "2083-01-01", Qty: 2501}},
			want:      []got{{1, 11, 1, 0}, {2, 11, 2500, 0}},
		},
		{
			name:      "several consumers on the same day share a lot in order",
			lots:      []Lot{lot(1, "2083-01-01", 3)},
			consumers: []Consumer{sale(11, "2083-01-02", 1), sale(12, "2083-01-02", 1), sale(13, "2083-01-02", 1)},
			want:      []got{{1, 11, 1000, 0}, {1, 12, 1000, 1000}, {1, 13, 1000, 2000}},
		},
		{
			name:      "a sale spanning lots records each lot's offset",
			lots:      []Lot{lot(1, "2083-01-01", 10), lot(2, "2083-01-02", 10)},
			consumers: []Consumer{sale(11, "2083-01-03", 6), sale(12, "2083-01-03", 8)},
			want:      []got{{1, 11, 6000, 0}, {1, 12, 4000, 6000}, {2, 12, 4000, 0}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			allocs, short := Allocate(tt.lots, tt.consumers)

			if tt.short != 0 {
				if short == nil {
					t.Fatalf("expected consumer %d to fall short, got allocations %v", tt.short, simplify(allocs))
				}
				if got := short.Consumer.ID.Bytes[0]; got != tt.short {
					t.Errorf("short consumer = %d, want %d", got, tt.short)
				}
				if short.Available != tt.available {
					t.Errorf("available = %d, want %d", short.Available, tt.available)
				}
				if allocs != nil {
					t.Errorf("expected no allocations with a shortfall, got %v", simplify(allocs))
				}
				return
			}

			if short != nil {
				t.Fatalf("unexpected shortfall for consumer %d (available %d)", short.Consumer.ID.Bytes[0], short.Available)
			}
			gotAllocs := simplify(allocs)
			if len(gotAllocs) != len(tt.want) {
				t.Fatalf("allocations = %v, want %v", gotAllocs, tt.want)
			}
			for i := range tt.want {
				if gotAllocs[i] != tt.want[i] {
					t.Errorf("allocation %d = %v, want %v", i, gotAllocs[i], tt.want[i])
				}
			}
		})
	}
}

func TestShortfallErrorMessage(t *testing.T) {
	err := &ShortfallError{
		ProductName: "Pant",
		ProductUnit: "pieces",
		Shortfall: Shortfall{
			Consumer:  Consumer{Kind: KindSale, Date: "2083-07-01", BillNo: "12", Qty: 8000},
			Available: 5500,
		},
	}
	want := `Not enough "Pant" in stock for the sale on 2083-07-01 (bill 12): needs 8 pieces, only 5.5 available`
	if err.Error() != want {
		t.Errorf("Error() = %q, want %q", err.Error(), want)
	}
	if got, want := err.LineMessage(), "Only 5.5 pieces in stock on 2083-07-01"; got != want {
		t.Errorf("LineMessage() = %q, want %q", got, want)
	}

	err.Shortfall.Consumer = Consumer{Kind: KindWastage, Date: "2083-07-02", Qty: 1}
	err.Shortfall.Available = 0
	want = `Not enough "Pant" in stock for the wastage on 2083-07-02: needs 0.001 pieces, only 0 available`
	if err.Error() != want {
		t.Errorf("Error() = %q, want %q", err.Error(), want)
	}
}
