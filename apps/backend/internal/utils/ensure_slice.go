package utils

func EnsureSlice[T any](s []T) []T {
	if s == nil {
		return []T{}
	}
	return s
}
