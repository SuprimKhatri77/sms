import z from "zod";

const studentDiscountSchema = z.object({
  id: z.uuid(),
  studentID: z.uuid(),
  type: z.string(),
  note: z.string().optional(),
  percent: z.number().gte(0).lte(100),
  amount: z.number().gte(0),
  createdAt: z.date(),
});

const discountBaseFields = {
  type: z
    .string({ error: "Discount type is required" })
    .trim()
    .min(1, { error: "Discount type is required" })
    .max(50, { error: "Discount type cannot exceed 50 characters" }),

  note: z
    .string({ error: "Note must be a string" })
    .trim()
    .min(1, { error: "Note cannot be empty" })
    .max(100, { error: "Note cannot exceed 100 characters" })
    .optional(),
};

const percentModeDiscountSchema = z.object({
  mode: z.literal("percent"),
  ...discountBaseFields,
  percent: z.coerce
    .number({ error: "Discount percentage is required" })
    .gte(0.01, { error: "Discount percentage must be at least 0.01" })
    .lte(100, { error: "Discount percentage cannot exceed 100" }),
});

const amountModeDiscountSchema = z.object({
  mode: z.literal("amount"),
  ...discountBaseFields,
  amount: z.coerce
    .number({ error: "Discount amount is required" })
    .min(0.01, { error: "Discount amount must be at least Rs 0.01" })
    .lte(10000000, { error: "Discount amount is unrealistically large" }),
});

export const studentDiscountMutationSchema = z.discriminatedUnion("mode", [
  percentModeDiscountSchema,
  amountModeDiscountSchema,
]);

export type StudentDiscountMutationInput = z.infer<
  typeof studentDiscountMutationSchema
>;

export type CreateStudentDiscountRequest = z.infer<
  typeof studentDiscountMutationSchema
>;

export type UpdateStudentDiscountRequest = z.infer<
  typeof studentDiscountMutationSchema
>;

export const createStudentDiscountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: studentDiscountSchema,
});

export type CreateStudentDiscountResponse = z.infer<
  typeof createStudentDiscountResponseSchema
>;

export const updateStudentDiscountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type UpdateStudentDiscountResponse = z.infer<
  typeof updateStudentDiscountResponseSchema
>;

export const deleteStudentDiscountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type DeleteStudentDiscountResponse = z.infer<
  typeof deleteStudentDiscountResponseSchema
>;
