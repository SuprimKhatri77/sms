package types

type CreateProductRequest struct {
	Name string `json:"name" binding:"required,min=2,max=50"`
	Unit string `json:"unit" binding:"required,min=1,max=20"`
}

type UpdateProductRequest struct {
	Name string `json:"name" binding:"required,min=2,max=50"`
	Unit string `json:"unit" binding:"required,min=1,max=20"`
}
