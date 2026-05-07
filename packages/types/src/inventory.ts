import z from "zod";
import { errorResponse } from "./base";

export const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  unit: z.string(),
  createdAt: z.date(),
});

export const getProductsResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(productSchema),
    meta: z.object({
      total: z.number(),
      totalPages: z.number(),
      limit: z.number(),
      page: z.number(),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type GetProductResponse = z.infer<typeof getProductsResponseSchema>;

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  unit: z.string().min(1, "unit is required").max(20),
});

export const createProductResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: productSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
    errors: z.array(errorResponse).optional(),
  }),
]);
export const updateProductResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
    errors: z.array(errorResponse).optional(),
  }),
]);

export const deleteProductResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type DeleteProductResponse = z.infer<typeof deleteProductResponseSchema>;
export type UpdateProductResponse = z.infer<typeof updateProductResponseSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateProductResponse = z.infer<typeof createProductResponseSchema>;
