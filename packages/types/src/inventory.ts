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
const adDateSchema = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    "Date must be in YYYY-MM-DD format",
  );
const bsDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "BS date must be in YYYY-MM-DD format");

// qty matches the NUMERIC(12,3) qty columns; rate is rupees stored as paisa.
const quantitySchema = z
  .number()
  .min(0.001, "Quantity must be at least 0.001")
  .max(10000000, "Quantity can be at most 10000000")
  .multipleOf(0.001, "Quantity can have at most 3 decimal places");
const rateSchema = z
  .number()
  .min(0.01, "Rate must be at least 0.01")
  .max(999999.99, "Rate can be at most 999999.99")
  .multipleOf(0.01, "Rate can have at most 2 decimal places");

export const stockInLineItemSchema = z.object({
  productID: z.uuid(),
  quantity: quantitySchema,
  rate: rateSchema,
});

export const updateStockInSchema = stockInLineItemSchema.extend({
  date: adDateSchema,
  note: optionalString,
  invoiceNo: optionalString,
});

export const createStockInBatchSchema = z.object({
  supplierID: z.uuid({ error: "Supplier is required" }),
  date: adDateSchema,
  bsDate: bsDateSchema,
  note: optionalString,
  invoiceNo: optionalString,
  items: z
    .array(stockInLineItemSchema)
    .min(1, "Add at least one item")
    .max(100)
    .superRefine((items, ctx) => {
      // each line becomes a supplier ledger credit, which must be at least
      // 1 paisa — same integer check as utils.LineAmount on the backend
      items.forEach((item, i) => {
        const qtyThousandths = Math.round(item.quantity * 1000);
        const ratePaisa = Math.round(item.rate * 100);
        if (
          qtyThousandths >= 1 &&
          ratePaisa >= 1 &&
          qtyThousandths * ratePaisa < 500
        ) {
          ctx.addIssue({
            code: "custom",
            path: [i, "quantity"],
            message: "Line total (qty x rate) must be at least Rs. 0.01",
          });
        }
      });
    }),
});

export type StockInLineItemInput = z.infer<typeof stockInLineItemSchema>;
export type UpdateStockInInput = z.infer<typeof updateStockInSchema>;
export type CreateStockInBatchInput = z.infer<typeof createStockInBatchSchema>;

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
export const createStockInBatchResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(stockInSchema),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);

export type CreateStockInBatchResponse = z.infer<
  typeof createStockInBatchResponse
>;

export const updateStockInResponse = z.discriminatedUnion("success", [
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

export type UpdateStockInResponse = z.infer<typeof updateStockInResponse>;

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

export const stockOutLineItemSchema = z.object({
  productID: z.uuid(),
  quantity: quantitySchema,
  rate: rateSchema,
});
export type StockOutLineItemInput = z.infer<typeof stockOutLineItemSchema>;

export const createStockOutBatchSchema = z.object({
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Date must be in YYYY-MM-DD format",
    ),
  note: z.string().optional(),
  billNo: z.string().optional(),
  items: z
    .array(stockOutLineItemSchema)
    .min(1, "Add at least one item")
    .max(100),
});
export type CreateStockOutBatchInput = z.infer<
  typeof createStockOutBatchSchema
>;

export const createStockOutBatchResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(stockOutSchema),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);

export type CreateStockOutBatchResponse = z.infer<
  typeof createStockOutBatchResponse
>;

export const editStockOutSchema = stockOutLineItemSchema.extend({
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
  qty: z.number().gt(0),
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

export const wastageLineItemSchema = z.object({
  productID: z.uuid(),
  quantity: quantitySchema,
  rate: rateSchema,
});
export type WastageLineItemInput = z.infer<typeof wastageLineItemSchema>;

export const createWastageBatchSchema = z.object({
  date: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Date must be in YYYY-MM-DD format",
    ),
  reason: z.string().optional(),
  items: z
    .array(wastageLineItemSchema)
    .min(1, "Add at least one item")
    .max(100),
});

export type CreateWastageBatchInput = z.infer<typeof createWastageBatchSchema>;

export const createWastageBatchResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(wastageRecordSchema),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorResponse).optional(),
    code: z.string(),
  }),
]);

export type CreateWastageBatchResponse = z.infer<
  typeof createWastageBatchResponse
>;

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

export const editWastageSchema = wastageLineItemSchema.extend({
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
