package types

import "github.com/jackc/pgx/v5/pgtype"

type Payment struct {
	ID          pgtype.UUID        `json:"id"`
	StudentID   pgtype.UUID        `json:"studentID"`
	Amount      int32              `json:"amount"`
	AddedBy     pgtype.UUID        `json:"addedBy"`
	AddedAt     pgtype.Timestamptz `json:"addedAt"`
	Remarks     pgtype.Text        `json:"remarks"`
	AddedByName string             `json:"addedByName"`
}

type AddPaymentRequest struct {
	Amount  float64 `json:"amount" binding:"required,gt=0"`
	AddedBy string  `json:"addedBy" binding:"required,uuid"`
	Remarks string  `json:"remarks,omitempty" binding:"omitempty,min=5"`
}
