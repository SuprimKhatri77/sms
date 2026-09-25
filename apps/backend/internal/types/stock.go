package types

type UpdateStockInRequest struct {
	ProductID  string  `json:"productID" binding:"required,uuid"`
	SupplierID string  `json:"supplierID" binding:"required,uuid"`
	Date       string  `json:"date" binding:"required,bs_date"`
	InvoiceNo  string  `json:"invoiceNo" binding:"omitempty"`
	Quantity   float64 `json:"quantity" binding:"required,min=0.001,max=10000000"`
	Rate       float64 `json:"rate" binding:"required,min=0.01,max=999999.99"`
	Note       string  `json:"note" binding:"omitempty"`
}

type SaleLineItem struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Quantity  float64 `json:"quantity" binding:"required,min=0.001,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,min=0.01,max=999999.99"`
}

type CreateSaleBatchRequest struct {
	Date   string         `json:"date" binding:"required,bs_date"`
	BillNo string         `json:"billNo" binding:"omitempty"`
	Note   string         `json:"note" binding:"omitempty"`
	Items  []SaleLineItem `json:"items" binding:"required,min=1,max=100,dive"`
}

type UpdateStockOutRequest struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Date      string  `json:"date" binding:"required,bs_date"`
	BillNo    string  `json:"billNo" binding:"omitempty"`
	Quantity  float64 `json:"quantity" binding:"required,min=0.001,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,min=0.01,max=999999.99"`
	Note      string  `json:"note" binding:"omitempty"`
}

type WastageLineItem struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Quantity  float64 `json:"quantity" binding:"required,min=0.001,max=10000000"`
	Rate      float64 `json:"rate" binding:"required,min=0.01,max=999999.99"`
}

type CreateWastageBatchRequest struct {
	Date   string            `json:"date" binding:"required,bs_date"`
	Reason string            `json:"reason" binding:"omitempty"`
	Items  []WastageLineItem `json:"items" binding:"required,min=1,max=100,dive"`
}
type UpdateWastageRequest struct {
	ProductID string  `json:"productID" binding:"required,uuid"`
	Quantity  float64 `json:"quantity" binding:"required,min=0.001,max=10000000"`
	Date      string  `json:"date" binding:"required,bs_date"`
	Rate      float64 `json:"rate" binding:"required,min=0.01,max=999999.99"`
	Reason    string  `json:"reason" binding:"omitempty"`
}
