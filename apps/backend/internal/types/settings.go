package types

type UpdateSetting struct {
	Value string `json:"value" binding:"required,min=1,max=30"`
}
