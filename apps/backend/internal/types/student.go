package types

type CreateStudentRequest struct {
	FullName      string   `json:"fullName" binding:"required,min=2,max=70,alphaspace"`
	DOB           string   `json:"dob" binding:"required,date_format"`
	Phone         string   `json:"phone" binding:"required,nepal_phone"`
	Email         string   `json:"email" binding:"required,email"`
	Address       string   `json:"address" binding:"required,max=70"`
	PhotoUrl      string   `json:"photoUrl" binding:"required,url"`
	ClaimedAmount float64  `json:"claimedAmount" binding:"required,gt=0"`
	Source        string   `json:"source" binding:"required,oneof=facebook instagram tiktok referral inPerson"`
	GuardianName  string   `json:"guardianName" binding:"required,min=2,max=70"`
	GuardianPhone string   `json:"guardianPhone" binding:"required,nepal_phone"`
	Gender        string   `json:"gender" binding:"required,oneof=male female others"`
	Courses       []string `json:"courses" binding:"required,min=1,dive,uuid"`
}

type CreateStudentInquiryRequest struct {
	FullName string `json:"fullName" binding:"required,alphaspace"`
	Phone    string `json:"phone" binding:"required,nepal_phone"`
	Message  string `json:"message" binding:"required,min=5,max=200"`
	Email    string `json:"email" binding:"required,email"`
	Source   string `json:"source" binding:"required,oneof= facebook instagram tiktok referral inPerson"`
}
