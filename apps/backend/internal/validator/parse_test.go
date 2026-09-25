package validator

import (
	"errors"
	"testing"

	"github.com/go-playground/validator/v10"
)

type parseTestReq struct {
	Quantity float64  `json:"quantity" binding:"required,min=0.001,max=10000000"`
	Page     int      `json:"page" binding:"min=1"`
	Name     string   `json:"name" binding:"min=5,max=10"`
	Items    []string `json:"items" binding:"min=1"`
	Email    string   `json:"email" binding:"required"`
}

// validates like gin's binding (tag name "binding") and returns the parsed
// errors keyed by field
func parseFor(t *testing.T, req parseTestReq) map[string][2]string {
	t.Helper()
	v := validator.New()
	v.SetTagName("binding")
	err := v.Struct(req)
	if err == nil {
		t.Fatal("expected validation errors, got none")
	}
	out := map[string][2]string{}
	for _, e := range Parse(err, req) {
		out[e.Field] = [2]string{e.Code, e.Message}
	}
	return out
}

func valid() parseTestReq {
	return parseTestReq{Quantity: 1, Page: 1, Name: "abcdef", Items: []string{"x"}, Email: "a@b.c"}
}

func TestParseMinMaxByKind(t *testing.T) {
	tests := []struct {
		name  string
		mod   func(r *parseTestReq)
		field string
		code  string
		msg   string
	}{
		{"float below min", func(r *parseTestReq) { r.Quantity = 0.0001 }, "quantity", "OUT_OF_RANGE", "quantity must be at least 0.001"},
		{"float above max", func(r *parseTestReq) { r.Quantity = 20000000 }, "quantity", "OUT_OF_RANGE", "quantity cannot exceed 10000000"},
		{"int below min", func(r *parseTestReq) { r.Page = 0 }, "page", "OUT_OF_RANGE", "page must be at least 1"},
		{"string too short", func(r *parseTestReq) { r.Name = "ab" }, "name", "TOO_SHORT", "name must be at least 5 characters"},
		{"string too long", func(r *parseTestReq) { r.Name = "abcdefghijklmnop" }, "name", "TOO_LONG", "name cannot exceed 10 characters"},
		{"slice below min", func(r *parseTestReq) { r.Items = []string{} }, "items", "TOO_SHORT", "items must have at least 1 item(s)"},
		{"required unchanged", func(r *parseTestReq) { r.Email = "" }, "email", "REQUIRED_FIELD", "email is required"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := valid()
			tt.mod(&req)
			got, ok := parseFor(t, req)[tt.field]
			if !ok {
				t.Fatalf("no error for field %q", tt.field)
			}
			if got[0] != tt.code || got[1] != tt.msg {
				t.Errorf("got (%s, %q), want (%s, %q)", got[0], got[1], tt.code, tt.msg)
			}
		})
	}
}

func TestParseNonValidationError(t *testing.T) {
	errs := Parse(errors.New("unexpected EOF"), parseTestReq{})
	if len(errs) != 1 || errs[0].Code != "INVALID_REQUEST" {
		t.Errorf("got %+v, want single INVALID_REQUEST", errs)
	}
}
