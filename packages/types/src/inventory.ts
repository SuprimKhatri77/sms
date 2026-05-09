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

const optionalString = z.string().optional().or(z.literal(""));
export const createStockInSchema = z.object({
  productID: z.uuid(),
  quantity: z.number().min(1),
  rate: z.number().gt(0),
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Date must be in YYYY-MM-DD format",
    ),
  note: optionalString,
  invoiceNo: optionalString,
});

export type CreateStockInInput = z.infer<typeof createStockInSchema>;

const stockInSchema = z.object({
  id: z.uuid(),
  productID: z.uuid(),
  rate: z.number(),
  qty: z.number(),
  date: z.string(),
  note: z.string().optional(),
  invoiceNo: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const createStockInResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: stockInSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);

export type CreateStockInResponse = z.infer<typeof createStockInResponse>;

export const listStockInResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(
      stockInSchema.extend({
        productUnit: z.string(),
        productName: z.string(),
      }),
    ),
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

export type ListStockInResponse = z.infer<typeof listStockInResponse>;

export const deleteStockInResponseSchema = z.discriminatedUnion("success", [
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

export type DeleteStockInResponse = z.infer<typeof deleteStockInResponseSchema>;

const stockOutSchema = z.object({
  id: z.uuid(),
  productID: z.uuid(),
  rate: z.number(),
  qty: z.number(),
  date: z.string(),
  note: z.string().optional(),
  billNo: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const listStockOutResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(
      stockOutSchema.extend({
        productUnit: z.string(),
        productName: z.string(),
      }),
    ),
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

export type ListStockOutResponse = z.infer<typeof listStockOutResponse>;

export const createStockOutSchema = z.object({
  productID: z.uuid(),
  rate: z.number().gt(0),
  quantity: z.number().min(1),
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Date must be in YYYY-MM-DD format",
    ),
  note: z.string().optional(),
  billNo: z.string().optional(),
});
export type CreateStockOutInput = z.infer<typeof createStockOutSchema>;

export const createStockOutResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: stockOutSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);

export type CreateStockOutResponse = z.infer<typeof createStockOutResponse>;

export const editStockOutSchema = z.object({
  productID: z.uuid(),
  rate: z.number().gt(0),
  quantity: z.number().min(1),
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Date must be in YYYY-MM-DD format",
    ),
  note: z.string().optional(),
  billNo: z.string().optional(),
});
export type EditStockOutInput = z.infer<typeof editStockOutSchema>;

export const editStockOutResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: stockOutSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);
export type EditStockOutResponse = z.infer<typeof editStockOutResponse>;

export const deleteStockOutResponseSchema = z.discriminatedUnion("success", [
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

export type DeleteStockOutResponse = z.infer<
  typeof deleteStockOutResponseSchema
>;

const wastageRecordSchema = z.object({
  id: z.uuid(),
  productID: z.uuid(),
  productName: z.string(),
  productUnit: z.string(),
  qty: z.number().min(1),
  date: z.string(),
  rate: z.number().gt(0),
  reason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const listWastageResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(wastageRecordSchema),
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

export type ListWastageResponse = z.infer<typeof listWastageResponse>;

export const createWastageSchema = z.object({
  productID: z.uuid(),
  quantity: z.number().min(1),
  rate: z.number().gt(0),
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Date must be in YYYY-MM-DD format",
    ),
  reason: z.string().optional(),
});

export type CreateWastageInput = z.infer<typeof createWastageSchema>;

export const createWastageResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: wastageRecordSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);

export type CreateWastageResponse = z.infer<typeof createWastageResponse>;

export const deleteWastageResponseSchema = z.discriminatedUnion("success", [
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

export type DeleteWastageResponse = z.infer<typeof deleteWastageResponseSchema>;

export const editWastageSchema = z.object({
  productID: z.uuid(),
  quantity: z.number().min(1),
  rate: z.number().gt(0),
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Date must be in YYYY-MM-DD format",
    ),
  reason: z.string().optional(),
});

export type EditWastageInput = z.infer<typeof editWastageSchema>;

export const editWastageResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: wastageRecordSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);

export type EditWastageResponse = z.infer<typeof editWastageResponse>;

export const inventorySummarySchema = z.object({
  productId: z.uuid(),
  productName: z.string(),
  productUnit: z.string(),
  stockInQty: z.number(),
  stockOutQty: z.number(),
  wastageQty: z.number(),
  closingQty: z.number(),
  stockInAmount: z.number(),
  stockOutAmount: z.number(),
  wastageAmount: z.number(),
  closingAmount: z.number(),
});

export type InventorySummaryRow = z.infer<typeof inventorySummarySchema>;

export const inventorySummaryResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(inventorySummarySchema),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type InventorySummaryResponse = z.infer<
  typeof inventorySummaryResponseSchema
>;
