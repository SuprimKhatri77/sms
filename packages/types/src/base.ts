import { z } from "zod";

export const baseAPIResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  code: z.string().optional(),
});

export const fieldErrorSchema = z.object({
  code: z.string(),
  field: z.string(),
  message: z.string(),
});

export const apiErrorSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  code: z.string().optional(),
  errors: z.array(fieldErrorSchema).optional(),
});

export const errorResponse = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string(),
});

const apiResponseSchema = baseAPIResponseSchema.extend({
  errors: z.array(errorResponse).optional(),
});

export type APIResponse = z.infer<typeof apiResponseSchema>;
export type FieldError = z.infer<typeof fieldErrorSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type BaseAPIResponse = z.infer<typeof baseAPIResponseSchema>;
