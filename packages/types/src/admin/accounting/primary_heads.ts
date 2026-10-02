import z from "zod";

const primaryHeadSchema = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullable(),
  name: z.string(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.string(),
});

export type PrimaryHead = z.infer<typeof primaryHeadSchema>;

export const getPrimaryHeadsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(primaryHeadSchema),
});

export type GetPrimaryHeadsResponse = z.infer<
  typeof getPrimaryHeadsResponseSchema
>;

// Empty strings mean "not set"; the backend stores them as NULL. parentId is
// "" for a top-level head.
export const primaryHeadInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  code: z.string().trim().max(20, "Code cannot exceed 20 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),
  parentId: z.uuid().or(z.literal("")),
});

export type PrimaryHeadInput = z.infer<typeof primaryHeadInputSchema>;

export const createPrimaryHeadResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: primaryHeadSchema,
});

export type CreatePrimaryHeadResponse = z.infer<
  typeof createPrimaryHeadResponseSchema
>;

export const updatePrimaryHeadResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type UpdatePrimaryHeadResponse = z.infer<
  typeof updatePrimaryHeadResponseSchema
>;

export const deletePrimaryHeadResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type DeletePrimaryHeadResponse = z.infer<
  typeof deletePrimaryHeadResponseSchema
>;
