package utils

import "testing"

func TestPercentToAmount(t *testing.T) {
	tests := []struct {
		name    string
		base    int64
		percent float64
		want    int64
	}{
		{"truncation bug regression: 2.5% of 5000 rupees", 500000, 2.5, 12500},
		{"float basis-point edge case: 2.55%", 500000, 2.55, 12750},
		{"exact half rounds up (0.5 -> 1)", 2, 25, 1},
		{"just below half rounds down (40.2 -> 40)", 201, 20, 40},
		{"just above half rounds up (40.6 -> 41)", 203, 20, 41},
		{"whole percent unaffected", 500000, 10, 50000},
		{"100 percent returns base exactly", 500000, 100, 500000},
		{"small percent under 1 (previously truncated to 0)", 500000, 0.5, 2500},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := PercentToAmount(tt.base, tt.percent)
			if got != tt.want {
				t.Errorf("PercentToAmount(%d, %v) = %d, want %d", tt.base, tt.percent, got, tt.want)
			}
		})
	}
}

func TestAmountToPercent(t *testing.T) {
	tests := []struct {
		name   string
		base   int64
		amount int64
		want   float64
	}{
		{"simple 10 percent", 500000, 50000, 10},
		{"round trip of 2.5 percent case", 500000, 12500, 2.5},
		{"base zero returns 0", 0, 100, 0},
		{"base negative returns 0", -1, 100, 0},
		{"rounds to 2 decimal places", 300000, 100000, 33.33},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := AmountToPercent(tt.base, tt.amount)
			if got != tt.want {
				t.Errorf("AmountToPercent(%d, %d) = %v, want %v", tt.base, tt.amount, got, tt.want)
			}
		})
	}
}

func TestRupeesToPaisa(t *testing.T) {
	tests := []struct {
		name   string
		rupees float64
		want   int64
	}{
		{"whole rupees", 500, 50000},
		{"two decimal places", 125.50, 12550},
		{"clearly rounds up", 10.999, 1100},
		{"clearly rounds down", 10.001, 1000},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := RupeesToPaisa(tt.rupees)
			if got != tt.want {
				t.Errorf("RupeesToPaisa(%v) = %d, want %d", tt.rupees, got, tt.want)
			}
		})
	}
}
