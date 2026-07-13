export {
  loginInputSchema,
  loginResponse,
  signupInputSchema,
  type LoginInput,
  type LoginResponse,
  type User,
  type UsersList,
  type SignupResponse,
  type SignupInput,
  type JWTUser,
} from "./auth";

export {
  type BaseAPIResponse,
  type APIResponse,
  type APIError,
  type BaseErrorResponse,
  type PaginationMeta,
} from "./base";

export {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "./user";

export {
  createStudentAdmissionRequest,
  inquiryFormSchema,
  type CreateStudentAdmission,
  type InquiryForm,
} from "./student";

export { type ImageUploadResponse } from "./upload";

export {
  createProductResponseSchema,
  createStockInSchema,
  updateStockInSchema,
  createStockOutSchema,
  editStockOutSchema,
  createWastageSchema,
  editWastageSchema,
  type CreateProductInput,
  type CreateProductResponse,
  type GetProductResponse,
  type UpdateProductResponse,
  type DeleteProductResponse,
  type CreateStockInResponse,
  type CreateStockInInput,
  type UpdateStockInInput,
  type ListStockInResponse,
  type DeleteStockInResponse,
  type CreateStockOutInput,
  type ListStockOutResponse,
  type CreateStockOutResponse,
  type DeleteStockOutResponse,
  type EditStockOutResponse,
  type EditStockOutInput,
  type DeleteWastageResponse,
  type EditWastageResponse,
  type EditWastageInput,
  type CreateWastageInput,
  type CreateWastageResponse,
  type ListWastageResponse,
  type InventorySummaryResponse,
} from "./inventory";

export { type CoursesList, type CourseDetailResponse } from "./courses";

export {
  studentDiscountMutationSchema,
  type CreateStudentDiscountRequest,
  type UpdateStudentDiscountRequest,
  type DeleteStudentDiscountResponse,
  type UpdateStudentDiscountResponse,
  type CreateStudentDiscountResponse,
  type StudentDiscountMutationInput,
} from "./admin/students/discount";
export {
  studentScholarshipMutationSchema,
  type GetStudentScholarshipResponse,
  type StudentScholarshipMutationResponse,
  type StudentScholarshipInput,
} from "./admin/students/scholarship";

export { type StudentAdmissionResponse } from "./admission";
export {
  addPaymentSchema,
  createCourseSchema,
  updateCourseSchema,
  updateSetting,
  updateStudentStatusSchema,
  type ListStudent,
  type StudentDetail,
  type StudentEnrolledCourses,
  type StudentPaymentDetails,
  type UpdateStudentStatus,
  type UpdateStudentStatusResponse,
  type AddPayment,
  type AddPaymentResponse,
  type CoursesListResponse,
  type CreateCourse,
  type UpdateCourse,
  type ToggleCourse,
  type CreateCourseResponse,
  type UpdateCourseResponse,
  type DeleteCourse,
  type SettingsListResponse,
  type UpdateSettingResponse,
  type InquiriesList,
  type MarkInquiryReadResponse,
  type DeleteInquiryResponse,
  type AnalyticsResponse,
  type StudentScholarshipResponse,
  type StudentDiscountResponse,
} from "./admin";

export { type GetStudentOverviewResponse } from "./student_portal/overview";
export {
  type GetStudentFeeSummaryResponse,
  type GetStudentPaymentsResponse,
} from "./student_portal/payments";
export { type GetStudentCoursesResponse } from "./student_portal/enrollments";

export {
  updateStudentGuardianInfoInputSchema,
  updateStudentPersonalInfoInputSchema,
  type UpdateStudentInfoResponse,
} from "./admin/students/personal-info";

export {
  updateStudentImageInputSchema,
  type UpdateStudentImageInput,
  type UpdateStudentImageResponse,
} from "./admin/students/image";

export {
  certificateTypeSchema,
  issueCertificateInputSchema,
  certificateRecordSchema,
  issueCertificateResponseSchema,
  studentCertificateSchema,
  getStudentCertificatesResponseSchema,
  type IssueCertificateInput,
  type CertificateRecord,
  type IssueCertificateResponse,
  type StudentCertificate,
  type GetStudentCertificatesResponse,
  type GetStudentCertificateResponse,
} from "./admin/certificates";

export { type GetStudentPendingOverviewResponse } from "./student_portal/pending-overview";
export { type GetStudentRejectedOverviewResponse } from "./student_portal/rejected-overview";
export { type GetStudentDiscountsResponse } from "./student_portal/discounts";
export { type GetStudentPortalScholarshipResponse } from "./student_portal/scholarship";

export {
  certificateDetailsSchema,
  getCertificateDetailsResponseSchema,
  type CertificateDetails,
  type GetCertificateDetailsResponse,
} from "./certificates";

export {
  createBankInputSchema,
  updateBankInputSchema,
  type CreateBankInput,
  type UpdateBankInput,
  type CreateBankResponse,
  type UpdateBankResponse,
  type GetBanksResponse,
  type DeleteBankResponse,
  type SetDefaultBankResponse,
  type Bank,
} from "./admin/accounting/bank";

export {
  createBankAccountInputSchema,
  updateBankAccountInputSchema,
  type CreateBankAccountInput,
  type UpdateBankAccountInput,
  type DeleteBankAccountResponse,
  type CreateBankAccountResponse,
  type UpdateBankAccountResponse,
  type GetBankAccountResponse,
  type BankAccountsData,
  type BankAccount,
  type SetDefaultBankAccountResponse,
} from "./admin/accounting/bank_accounts";

export {
  createBankLedgerEntrySchema,
  type CreateBankLedgerEntryInput,
  type CreateBankLedgerEntryResponse,
  type BankLedger,
  type GetBankLedgerResponse,
  type BankLedgerData,
  type BankLedgerSummary,
  type GetBankLedgerSummaryRepsonse,
  type BankAccountForDropdown,
  type GetBankAccountsForDropdownResponse,
} from "./admin/accounting/bank_ledger";

export {
  createCashLedgerEntrySchema,
  type CreateCashLedgerEntryInput,
  type CreateCashLedgerEntryResponse,
  type CashLedger,
  type GetCashLedgerResponse,
  type CashLedgerData,
  type CashLedgerSummary,
  type GetCashLedgerSummaryResponse,
} from "./admin/accounting/cash_ledger";

export {
  createSupplierSchema,
  updateSupplierSchema,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type CreateSupplierResponse,
  type UpdateSupplierResponse,
  type DeleteSupplierResponse,
  type GetSupplierResponse,
  type SuppliersData,
  type Supplier,
} from "./admin/accounting/suppliers";

export {
  createSupplierLedgerEntryInput,
  type GetSupplierLedgerSummaryResponse,
  type CreateSupplierLedgerEntryInput,
  type CreateSupplierLedgerEntryResponse,
  type SupplierLedger,
  type GetSupplierLedgerResponse,
  type SupplierLedgerSummary,
  type SupplierLedgerData,
} from "./admin/accounting/supplier_ledger";

export {
  type BatchResponse,
  type GetDistinctBatchesResponse,
} from "./admin/students/batch";

export {
  updateProfileInputSchema,
  updatePasswordFormSchema,
  updatePasswordInputSchema,
  type UpdateProfileInput,
  type UpdateProfileResponse,
  type UpdatePasswordFormInput,
  type UpdatePasswordInput,
  type UpdatePasswordResponse,
} from "./admin/profile";
