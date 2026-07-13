package constants

const (
	// general
	InternalServerError = "INTERNAL_SERVER_ERROR"
	ValidationFailed    = "VALIDATION_FAILED"
	Unauthorized        = "UNAUTHORIZED"
	InvalidPageParam    = "INVALID_PAGE_PARAMETER"
	InvalidIDFormat     = "INVALID_ID_FORMAT"
	InvalidQueryParam   = "INVALID_QUERY_PARAM"

	// auth
	InvalidCredentials  = "INVALID_CREDENTIALS"
	MissingRefreshToken = "MISSING_REFRESH_TOKEN"
	InvalidRefreshToken = "INVALID_REFRESH_TOKEN"
	UserAlreadyExists   = "USER_ALREADY_EXISTS"
	RefreshTokenExpired = "REFRESH_TOKEN_EXPIRED"
	InvalidToken        = "INVALID_TOKEN"
	Forbidden           = "FORBIDDEN"
	MissingAccessToken  = "MISSING_ACCESS_TOKEN"
	InvalidAccessToken  = "INVALID_ACCESS_TOKEN"
	UserNotFound        = "USER_NOT_FOUND"

	// setting
	MissingSettingKey = "MISSING_SETTING_KEY"
	SettingNotFound   = "SETTING_NOT_FOUND"

	// student
	StudentAlreadyExists = "STUDENT_ALREADY_EXISTS"
	MissingStudentID     = "MISSING_STUDENT_ID"
	StudentNotFound      = "STUDENT_NOT_FOUND"
	InvalidStudentStatus        = "INVALID_STUDENT_STATUS"
	StudentNotRegistered        = "STUDENT_NOT_REGISTERED"
	StudentNotEnrolledInCourse  = "STUDENT_NOT_ENROLLED_IN_COURSE"

	// student payments
	PaymentNotFound = "PAYMENT_NOT_FOUND"

	// course
	CourseNotFound      = "COURSE_NOT_FOUND"
	MissingCourseID     = "MISSING_COURSE_ID"
	CourseAlreadyExists = "COURSE_ALREADY_EXISTS"

	// inquiries
	InquiryNotFound  = "INQUIRY_NOT_FOUND"
	MissingInquiryID = "MISSING_INQUIRY_ID"

	// image upload
	ImageIsRequired    = "IMAGE_IS_REQUIRED"
	InvalidImageFormat = "INVALID_IMAGE_FORMAT"
	InvalidImageSize   = "INVALID_IMAGE_SIZE"

	// inventory
	ProductAlreadyExists = "PRODUCT_ALREADY_EXISTS"
	ProductNotFound      = "PRODUCT_NOT_FOUND"
	MissingProductID     = "MISSING_PRODUCT_ID"

	MissingStockID = "MISSING_STOCK_ID"

	MissingWastageID = "MISSING_WASTAGE_ID"

	// student discounts
	MissingStudentDiscountID = "MISSING_STUDENT_DISCOUNT_ID"
	DiscountNotFound         = "DISCOUNT_NOT_FOUND"

	// student scholarships
	MissingStudentScholarshipID = "MISSING_STUDENT_SCHOLARSHIP_ID"
	ScholarshipNotFound         = "SCHOLARSHIP_NOT_FOUND"

	// banks
	BankAlreadyExists        = "BANK_ALREADY_EXISTS"
	DefaultBankAlreadyExists = "DEFAULT_BANK_ALREADY_EXISTS"
	MissingBankID            = "MISSING_BANK_ID"
	BankNotFound             = "BANK_NOT_FOUND"
	CannotDeleteDefaultBank  = "CANNOT_DELETE_DEFAULT_BANK"
	CannotUnsetDefaultBank   = "CANNOT_UNSET_DEFAULT_BANK"

	// bank accounts
	BankAccountAlreadyExists        = "BANK_ACCOUNT_ALREADY_EXISTS"
	DefaultBankAccountAlreadyExists = "DEFAULT_BANK_ACCOUNT_ALREADY_EXISTS"
	BankAccountNotFound             = "BANK_ACCOUNT_NOT_FOUND"
	BankAccountHasLedgerEntries     = "BANK_ACCOUNT_HAS_LEDGER_ENTRIES"
	CannotDeleteDefaultBankAccount  = "CANNOT_DELETE_DEFAULT_BANK_ACCOUNT"
	CannotUnsetDefaultBankAccount   = "CANNOT_UNSET_DEFAULT_BANK_ACCOUNT"
	NoDefaultBankAccount            = "NO_DEFAULT_BANK_ACCOUNT"

	// suppliers
	CompanyAlreadyExists = "COMPANY_ALREADY_EXISTS"
	VatNoAlreadyExists   = "VAT_NO_ALREADY_EXISTS"
	SupplierNotFound     = "SUPPLIER_NOT_FOUND"
	MissingSupplierID    = "MISSING_SUPPLIER_ID"
	StockNotFound        = "STOCK_NOT_FOUND"

	// certificates
	CertificateAlreadyExists = "CERTIFICATE_ALREADY_EXISTS"
	CertificateNotFound      = "CERTIFICATE_NOT_FOUND"
)
