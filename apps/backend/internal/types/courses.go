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

type CreateCourse struct {
	Name     string  `json:"name" binding:"required,notblank,min=2,max=50"`
	IsActive *bool   `json:"isActive" binding:"required"`
	Fee      float64 `json:"fee" binding:"required,min=0.01,max=10000000"`
}
type UpdateCourse struct {
	Name     string  `json:"name" binding:"required,notblank,min=2,max=50"`
	IsActive *bool   `json:"isActive" binding:"required"`
	Fee      float64 `json:"fee" binding:"required,min=0.01,max=10000000"`
}

type ToggleCourseStatus struct {
	IsActive *bool `json:"isActive" binding:"required"`
}
