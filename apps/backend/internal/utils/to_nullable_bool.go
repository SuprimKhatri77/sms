package utils

import "github.com/jackc/pgx/v5/pgtype"

func ToNullableBool(b *bool) pgtype.Bool {
	if b == nil {
		return pgtype.Bool{Valid: false}
	}
	return pgtype.Bool{Bool: *b, Valid: true}
}
