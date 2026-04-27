export {
  loginInputSchema,
  loginResponse,
  type LoginInput,
  type LoginResponse,
  type User,
  type UsersList,
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
