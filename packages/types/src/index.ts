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
} from "./auth";

export { type BaseAPIResponse, type APIResponse } from "./base";

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

export { type CoursesList } from "./courses";
export {
  addPaymentSchema,
  createCourseSchema,
  updateCourseSchema,
  updateSetting,
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
} from "./admin";
