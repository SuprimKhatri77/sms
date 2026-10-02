package types

type CreateProductRequest struct {
	Name string `json:"name" binding:"required,min=2,max=50"`
	Unit string `json:"unit" binding:"required,min=1,max=20"`
	// Checked as a UUID because utils.ToNullableUUID would quietly turn a
	// malformed ID into "no category".
	CategoryID string `json:"categoryId" binding:"omitempty,uuid"`
}

type UpdateProductRequest struct {
	Name       string `json:"name" binding:"required,min=2,max=50"`
	Unit       string `json:"unit" binding:"required,min=1,max=20"`
	CategoryID string `json:"categoryId" binding:"omitempty,uuid"`
}
