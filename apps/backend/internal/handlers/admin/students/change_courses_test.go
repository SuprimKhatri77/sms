package students

import (
	"slices"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

func courseID(b byte) pgtype.UUID {
	return pgtype.UUID{Bytes: [16]byte{b}, Valid: true}
}

func TestDiffCourseIDs(t *testing.T) {
	a, b, c := courseID(1), courseID(2), courseID(3)

	tests := []struct {
		name       string
		current    []pgtype.UUID
		requested  []pgtype.UUID
		wantAdd    []pgtype.UUID
		wantRemove []pgtype.UUID
	}{
		{name: "swap one course", current: []pgtype.UUID{a}, requested: []pgtype.UUID{b}, wantAdd: []pgtype.UUID{b}, wantRemove: []pgtype.UUID{a}},
		{name: "same set in another order", current: []pgtype.UUID{a, b}, requested: []pgtype.UUID{b, a}},
		{name: "add alongside kept course", current: []pgtype.UUID{a}, requested: []pgtype.UUID{a, b}, wantAdd: []pgtype.UUID{b}},
		{name: "drop one of two", current: []pgtype.UUID{a, b}, requested: []pgtype.UUID{b}, wantRemove: []pgtype.UUID{a}},
		{name: "duplicates only added once", current: []pgtype.UUID{a}, requested: []pgtype.UUID{c, c}, wantAdd: []pgtype.UUID{c}, wantRemove: []pgtype.UUID{a}},
		{name: "not enrolled in anything", requested: []pgtype.UUID{a}, wantAdd: []pgtype.UUID{a}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotAdd, gotRemove := diffCourseIDs(tt.current, tt.requested)
			if !slices.Equal(gotAdd, tt.wantAdd) {
				t.Errorf("toAdd = %v, want %v", gotAdd, tt.wantAdd)
			}
			if !slices.Equal(gotRemove, tt.wantRemove) {
				t.Errorf("toRemove = %v, want %v", gotRemove, tt.wantRemove)
			}
		})
	}
}

func TestCourseChangeBlockedMessage(t *testing.T) {
	if got := courseChangeBlockedMessage(db.GetStudentCourseChangeBlockersRow{}); got != "" {
		t.Errorf("no records: got %q, want no message", got)
	}

	blocked := []db.GetStudentCourseChangeBlockersRow{
		{PaymentCount: 1},
		{DiscountCount: 1},
		{ScholarshipCount: 1},
		{CertificateCount: 1},
	}
	for _, row := range blocked {
		if got := courseChangeBlockedMessage(row); got == "" {
			t.Errorf("%+v: expected a message", row)
		}
	}
}
