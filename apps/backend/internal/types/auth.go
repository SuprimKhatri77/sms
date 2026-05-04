package types

type CreateUserRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=50,alphaspace"`
	Email    string `json:"email" binding:"required,email"`
	Role     string `json:"role" binding:"required,oneof=user superadmin admin"`
	Password string `json:"password" binding:"required,min=8,max=50"`
}
type BootstrapRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=50,alphaspace"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=50"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=50"`
}

type SignupRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=50,alphaspace"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=50"`
}
