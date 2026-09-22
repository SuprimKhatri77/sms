import z from "zod";
import { paginationMetaSchema } from "../../base";

const supplierLedgerSchema = z.object({
  id: z.uuid(),
  supplierId: z.uuid(),
  date: z.string(),
  bsDate: z.string(),
  entryType: z.enum(["cr", "dr"]),
  amount: z.number(),
  description: z.string().optional(),
  stockInId: z.uuid().optional(),
  paymentType: z.string(),
  createdAt: z.string(),
  supplierName: z.string(),
});
export type SupplierLedger = z.infer<typeof supplierLedgerSchema>;

export const getSupplierLedgerResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(supplierLedgerSchema),
  meta: paginationMetaSchema,
});

export type GetSupplierLedgerResponse = z.infer<
  typeof getSupplierLedgerResponseSchema
>;

export const supplierLedgerData = z.object({
  supplierLedger: z.array(supplierLedgerSchema),
  meta: paginationMetaSchema,
});

export type SupplierLedgerData = z.infer<typeof supplierLedgerData>;

const supplierLedgerSummarySchema = z.object({
  totalCr: z.number(),
  totalDr: z.number(),
  outstanding: z.number(),
});

export type SupplierLedgerSummary = z.infer<typeof supplierLedgerSummarySchema>;

export const getSupplierLedgerSummaryResponse = z.object({
  success: z.literal(true),
  data: supplierLedgerSummarySchema,
});

export type GetSupplierLedgerSummaryResponse = z.infer<
  typeof getSupplierLedgerSummaryResponse
>;

export const createSupplierLedgerEntryInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: "AD date must be in YYYY-MM-DD format",
  }),
  bsDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: "BS date must be in YYYY-MM-DD format",
  }),
  entryType: z.enum(["cr", "dr"]),
  amount: z
    .number()
    .gt(0, {
      error: "Amount must be greater than 0",
    })
    .lte(10000000, {
      error: "Amount must not exceed Rs. 1,00,00,000",
    }),
  description: z
    .string()
    .trim()
    .min(5, { error: "Description must be at least 5 characters" })
    .max(200, { error: "Description must be 200 characters or less" })
    .optional(),
  paymentType: z
    .string()
    .trim()
    .min(2, { error: "Payment type is required" })
    .max(100, { error: "Payment type must be 100 characters or less" }),
  bankAccountID: z.uuid().optional(),
});

export type CreateSupplierLedgerEntryInput = z.infer<
  typeof createSupplierLedgerEntryInput
>;

export const createSupplierLedgerEntryResponse = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type CreateSupplierLedgerEntryResponse = z.infer<
  typeof createSupplierLedgerEntryResponse
>;
