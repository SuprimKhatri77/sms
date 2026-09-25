package utils

import (
	"testing"
	"time"
)

func TestBSToAD(t *testing.T) {
	got, err := BSToAD("2083-06-09")
	if err != nil {
		t.Fatalf("BSToAD returned error: %v", err)
	}
	want := time.Date(2026, time.September, 25, 0, 0, 0, 0, time.UTC)
	if !got.Equal(want) || got.Location() != time.UTC {
		t.Errorf("BSToAD(2083-06-09) = %v, want %v", got, want)
	}

	// round-trips with the create-purchase cross-check
	if err := ValidateBSMatchesAD("2083-06-09", got); err != nil {
		t.Errorf("BSToAD result failed ValidateBSMatchesAD: %v", err)
	}

	for _, bad := range []string{"", "2083-13-01", "not-a-date", "2083-06-40"} {
		if _, err := BSToAD(bad); err == nil {
			t.Errorf("BSToAD(%q) expected error, got nil", bad)
		}
	}
}
