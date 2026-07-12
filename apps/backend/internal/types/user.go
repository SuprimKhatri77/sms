package types

type UpdateUserRequest struct {
	Name string `json:"name" binding:"required,notblank,min=2,max=50,alphaspace"`
	// Email string `json:"email" binding:"required,email"`
	Role string `json:"role" binding:"required,oneof=student admin instructor"`
}
