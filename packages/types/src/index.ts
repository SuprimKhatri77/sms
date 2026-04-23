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
