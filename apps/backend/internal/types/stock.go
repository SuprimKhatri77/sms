package types

type CreateStockInRequest struct {
	ProductID string `json:"productID" binding:"required,uuid"`
	Date      string `json:"date" binding:"required"`
	InvoiceNo string `json:"invoiceNo" binding:"omitempty"`
	Quantity  int    `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      int    `json:"rate" binding:"required,gt=0"`
	Note      string `json:"note" binding:"omitempty"`
}

type UpdateStockInRequest struct {
	ProductID string `json:"productID" binding:"required,uuid"`
	Date      string `json:"date" binding:"required"`
	InvoiceNo string `json:"invoiceNo" binding:"omitempty"`
	Quantity  int    `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      int    `json:"rate" binding:"required,gt=0"`
	Note      string `json:"note" binding:"omitempty"`
}

type CreateStockOutRequest struct {
	ProductID string `json:"productID" binding:"required,uuid"`
	Date      string `json:"date" binding:"required"`
	BillNo    string `json:"billNo" binding:"omitempty"`
	Quantity  int    `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      int    `json:"rate" binding:"required,gt=0"`
	Note      string `json:"note" binding:"omitempty"`
}

type UpdateStockOutRequest struct {
	ProductID string `json:"productID" binding:"required,uuid"`
	Date      string `json:"date" binding:"required"`
	BillNo    string `json:"billNo" binding:"omitempty"`
	Quantity  int    `json:"quantity" binding:"required,min=1,max=10000000"`
	Rate      int    `json:"rate" binding:"required,gt=0"`
	Note      string `json:"note" binding:"omitempty"`
}

type CreateWastageRequest struct {
	ProductID string `json:"productID" binding:"required,uuid"`
	Quantity  int    `json:"quantity" binding:"required,min=1,max=10000000"`
	Date      string `json:"date" binding:"required"`
	Rate      int    `json:"rate" binding:"required,gt=0"`
	Reason    string `json:"reason" binding:"omitempty"`
}
