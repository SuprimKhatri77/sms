package repository

import (
	"context"

	db "github.com/suprimkhatri77/sms/backend/internal/database/generated"
)

type CoursesRepository interface {
	ListCourses(ctx context.Context) ([]db.Course, error)
	ListActiveCourses(ctx context.Context) ([]db.Course, error)
}
