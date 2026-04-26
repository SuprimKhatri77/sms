package types

import db "github.com/suprimkhatri77/sms/backend/internal/database/generated"

type InquiriesResponse struct {
	Inquiries   []db.Inquiry `json:"inquiries"`
	UnreadCount int          `json:"unreadCount"`
	ReadCount   int          `json:"readCount"`
}
