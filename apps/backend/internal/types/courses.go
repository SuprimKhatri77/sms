package types

import "github.com/jackc/pgx/v5/pgtype"

type Courses struct {
	ID       pgtype.UUID `json:"id"`
	Name     string      `json:"name"`
	Fee      int         `json:"fee"`
	IsActive bool        `json:"isActive"`
}

type CoursesResponse struct {
	ID       pgtype.UUID `json:"id"`
	Name     string      `json:"name"`
	Fee      int         `json:"fee"`
	IsActive bool        `json:"isActive"`
}
