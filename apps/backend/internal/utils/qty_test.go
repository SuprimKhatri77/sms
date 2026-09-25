package utils

import "testing"

func TestRoundQty(t *testing.T) {
	tests := []struct {
		name string
		qty  float64
		want float64
	}{
		{"whole number unaffected", 5, 5},
		{"3 decimals kept", 1.255, 1.255},
		{"float noise removed", 2.2999999999999998, 2.3},
		{"4th decimal rounds half-up", 1.2345, 1.235},
		{"4th decimal rounds down", 1.2344, 1.234},
		{"smallest allowed qty", 0.001, 0.001},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := RoundQty(tt.qty)
			if got != tt.want {
				t.Errorf("RoundQty(%v) = %v, want %v", tt.qty, got, tt.want)
			}
		})
	}
}

func TestLineAmount(t *testing.T) {
	tests := []struct {
		name      string
		qty       float64
		ratePaisa int32
		want      int64
	}{
		{"whole qty", 3, 9999, 29997},
		{"decimal qty: 1.25 x Rs 99.99", 1.25, 9999, 12499},
		{"float-inexact qty: 2.345 x 2 paisa (exact 4.69)", 2.345, 2, 5},
		{"exact half rounds up: 0.005 x 100 paisa = 0.5", 0.005, 100, 1},
		{"just below half rounds down: 0.004 x 100 paisa = 0.4", 0.004, 100, 0},
		{"max bounds line (no int64 overflow): 10,000,000 x Rs 999,999.99", 10000000, 99999999, 999999990000000},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := LineAmount(tt.qty, tt.ratePaisa)
			if got != tt.want {
				t.Errorf("LineAmount(%v, %d) = %d, want %d", tt.qty, tt.ratePaisa, got, tt.want)
			}
		})
	}
}
