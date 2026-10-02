import z from "zod";

const productCategorySchema = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  productCount: z.number(),
});

export type ProductCategory = z.infer<typeof productCategorySchema>;

export const getProductCategoriesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productCategorySchema),
});

export type GetProductCategoriesResponse = z.infer<
  typeof getProductCategoriesResponseSchema
>;

// Empty strings mean "not set"; the backend stores them as NULL. parentId is
// "" for a top-level category.
export const productCategoryInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),
  parentId: z.uuid().or(z.literal("")),
});

export type ProductCategoryInput = z.infer<typeof productCategoryInputSchema>;

export const createProductCategoryResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: productCategorySchema.omit({ productCount: true }),
});

export type CreateProductCategoryResponse = z.infer<
  typeof createProductCategoryResponseSchema
>;

export const productCategoryMessageResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type UpdateProductCategoryResponse = z.infer<
  typeof productCategoryMessageResponseSchema
>;
export type DeleteProductCategoryResponse = z.infer<
  typeof productCategoryMessageResponseSchema
>;
