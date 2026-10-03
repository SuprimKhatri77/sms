import z from "zod";
import { paginationMetaSchema } from "../../base";

export const employeeStatusValues = ["active", "inactive"] as const;
export type EmployeeStatus = (typeof employeeStatusValues)[number];

const employeeSchema = z.object({
  id: z.uuid(),
  /** the number behind the code; never reused */
  employeeNo: z.number(),
  /** e.g. EMP-001; tells apart people with the same name */
  code: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  designation: z.string().nullable(),
  address: z.string().nullable(),
  panNo: z.string().nullable(),
  notes: z.string().nullable(),
  /** paisa */
  monthlySalary: z.number().nullable(),
  /** AD, YYYY-MM-DD */
  joinDate: z.string().nullable(),
  joinDateBs: z.string().nullable(),
  status: z.enum(employeeStatusValues),
  createdAt: z.string(),
});
export type Employee = z.infer<typeof employeeSchema>;

export const getEmployeesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(employeeSchema),
  meta: paginationMetaSchema,
});
export type GetEmployeesResponse = z.infer<typeof getEmployeesResponseSchema>;

export const employeesData = z.object({
  employees: z.array(employeeSchema),
  meta: paginationMetaSchema,
});
export type EmployeesData = z.infer<typeof employeesData>;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} must be ${max} characters or less` })
    .optional();

/** Adding and editing an employee; the code is assigned by the server. */
export const employeeInputSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { error: "Name must be at least 2 characters" })
      .max(100, { error: "Name must be 100 characters or less" }),
    phone: z
      .string()
      .regex(/^(98|97)\d{8}$/, { error: "Enter a valid 10-digit mobile number" })
      .optional(),
    designation: optionalText(100, "Designation"),
    address: optionalText(200, "Address"),
    panNo: z
      .string()
      .regex(/^[0-9]{9}$/, { error: "PAN number must be 9 digits" })
      .optional(),
    notes: optionalText(500, "Notes"),
    /** rupees */
    monthlySalary: z
      .number({ error: "Enter an amount" })
      .min(0.01, { error: "Salary must be at least Rs 0.01" })
      .lte(10000000, { error: "Salary must not exceed Rs. 1,00,00,000" })
      .optional(),
    joinDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        error: "AD date must be in YYYY-MM-DD format",
      })
      .optional(),
    joinDateBs: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Choose a date" })
      .optional(),
    status: z.enum(employeeStatusValues).optional(),
  })
  .refine((data) => !!data.joinDate === !!data.joinDateBs, {
    error: "Choose a join date",
    path: ["joinDateBs"],
  });
export type EmployeeInput = z.infer<typeof employeeInputSchema>;

export const employeeMutationResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: employeeSchema,
});
export type EmployeeMutationResponse = z.infer<
  typeof employeeMutationResponseSchema
>;

export const deleteEmployeeResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});
export type DeleteEmployeeResponse = z.infer<
  typeof deleteEmployeeResponseSchema
>;
