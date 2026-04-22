package types

type AppError struct {
	Code    string `json:"code"`
	Field   string `json:"field,omitempty"`
	Message string `json:"message"`
}

type APIResponse struct {
	Success    bool       `json:"success"`
	Message    string     `json:"message,omitempty"`
	Code       string     `json:"code,omitempty"`
	Total      int        `json:"total,omitempty"`
	TotalPages int        `json:"totalPages,omitempty"`
	Errors     []AppError `json:"errors,omitempty"`
	Data       any        `json:"data,omitempty"`
}
