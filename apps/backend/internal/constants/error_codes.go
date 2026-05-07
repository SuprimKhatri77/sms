package constants

const (
	// general
	InternalServerError = "INTERNAL_SERVER_ERROR"
	ValidationFailed    = "VALIDATION_FAILED"
	Unauthorized        = "UNAUTHORIZED"
	InvalidPageParam    = "INVALID_PAGE_PARAMETER"
	InvalidIDFormat     = "INVALID_ID_FORMAT"

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
	InvalidStudentStatus = "INVALID_STUDENT_STATUS"

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
)
