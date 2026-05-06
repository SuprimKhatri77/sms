package utils

import "github.com/jackc/pgx/v5/pgtype"

func ToNullableText(s string) pgtype.Text {
	if s == "" {
		return pgtype.Text{Valid: false}
	}
	return pgtype.Text{String: s, Valid: true}
}
