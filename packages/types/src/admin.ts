import z from "zod";
import { baseAPIResponseSchema } from "./base";

export const listStudentResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(
      z.object({
        id: z.uuid(),
        fullName: z.string(),
        phone: z.string(),
        referenceNo: z.string(),
        courses: z.array(z.string()),
        status: z.enum(["pending", "completed", "rejected", "active"]),
        claimedAmount: z.number(),
      }),
    ),
    total: z.number(),
    totalPages: z.number(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type ListStudent = z.infer<typeof listStudentResponseSchema>;

export const studentDetailResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.object({
      id: z.uuid(),
      referenceNo: z.string(),
      fiscalYear: z.string(),
      serialNo: z.number,
      fullName: z.string(),
      dob: z.date(),
      gender: z.enum(["male", "female", "other"]),
      phone: z.string(),
      email: z.email(),
      address: z.string(),
      guardianName: z.string(),
      guardianPhone: z.string(),
      photoUrl: z.url(),
      source: z.enum([
        "facebook",
        "instagram",
        "tiktok",
        "referral",
        "inperson",
      ]),
      claimedAmount: z.number(),
      status: z.enum(["pending", "active", "completed", "rejected"]),
      notes: z.string(),
      createdAt: z.date(),
    }),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type StudentDetail = z.infer<typeof studentDetailResponseSchema>;

export const studentEnrolledCoursesResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      data: z.array(
        z.object({
          id: z.uuid(),
          name: z.string(),
          fee: z.number(),
          isActive: z.boolean(),
          createdAt: z.date(),
        }),
      ),
    }),

    z.object({
      success: z.literal(false),
      message: z.string(),
      code: z.string(),
    }),
  ],
);

export type StudentEnrolledCourses = z.infer<
  typeof studentEnrolledCoursesResponseSchema
>;

export const studentPaymentDetailsResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      data: z.array(
        z.object({
          id: z.uuid(),
          studentID: z.uuid(),
          addedBy: z.uuid(),
          addedAt: z.date(),
          remarks: z.string(),
          amount: z.number(),
          addedByName: z.string(),
        }),
      ),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
      code: z.string(),
    }),
  ],
);

export type StudentPaymentDetails = z.infer<
  typeof studentPaymentDetailsResponseSchema
>;

export const updateStudentStatusSchema = z.object({
  status: z.enum(["pending", "active", "completed", "rejected"]),
});

export type UpdateStudentStatus = z.infer<typeof updateStudentStatusSchema>;

export const updateStudentStatusResponseSchema = baseAPIResponseSchema;

export type UpdateStudentStatusResponse = z.infer<
  typeof updateStudentStatusResponseSchema
>;

export const addPaymentSchema = z.object({
  amount: z.number().gt(0),
  addedBy: z.uuid(),
  remarks: z.string().min(3).max(100).optional(),
});

export type AddPayment = z.infer<typeof addPaymentSchema>;

export const addPaymentResponseSchema = baseAPIResponseSchema;
export type AddPaymentResponse = z.infer<typeof addPaymentResponseSchema>;
