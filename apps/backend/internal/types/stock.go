package types

type UpdateStockInRequest struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Date      string  `json:"date" binding:"required"`
	InvoiceNo string  `json:"invoiceNo" binding:"omitempty"`
	Quantity  int     `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,gt=0"`
	Note      string  `json:"note" binding:"omitempty"`
}

type SaleLineItem struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Quantity  int     `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,gt=0"`
}

type CreateSaleBatchRequest struct {
	Date   string         `json:"date" binding:"required"`
	BillNo string         `json:"billNo" binding:"omitempty"`
	Note   string         `json:"note" binding:"omitempty"`
	Items  []SaleLineItem `json:"items" binding:"required,min=1,max=100,dive"`
}

type UpdateStockOutRequest struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Date      string  `json:"date" binding:"required"`
	BillNo    string  `json:"billNo" binding:"omitempty"`
	Quantity  int     `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,gt=0"`
	Note      string  `json:"note" binding:"omitempty"`
}

type WastageLineItem struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Quantity  int     `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,gt=0"`
}

type CreateWastageBatchRequest struct {
	Date   string            `json:"date" binding:"required"`
	Reason string            `json:"reason" binding:"omitempty"`
	Items  []WastageLineItem `json:"items" binding:"required,min=1,max=100,dive"`
}
type UpdateWastageRequest struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Quantity  int     `json:"quantity" binding:"required,min=1,max=10000000"`
	Date      string  `json:"date" binding:"required"`
	Rate      float64 `json:"rate" binding:"required,gt=0"`
	Reason    string  `json:"reason" binding:"omitempty"`
}
