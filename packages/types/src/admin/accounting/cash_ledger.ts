import z from "zod";
import { paginationMetaSchema } from "../../base";

const cashLedgerResponseData = z.object({
  id: z.uuid(),
  date: z.string(),
  bsDate: z.string(),
  entryType: z.enum(["dr", "cr"]),
  amount: z.number(),
  description: z.string().optional(),
  paymentId: z.uuid().optional(),
  createdAt: z.string(),
});

export type CashLedger = z.infer<typeof cashLedgerResponseData>;

export const getCashLedgerResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(cashLedgerResponseData),
  meta: paginationMetaSchema,
});

export type GetCashLedgerResponse = z.infer<typeof getCashLedgerResponseSchema>;

export const cashLedgerData = z.object({
  cashLedger: z.array(cashLedgerResponseData),
  meta: paginationMetaSchema,
});
export type CashLedgerData = z.infer<typeof cashLedgerData>;

const cashLedgerSummaryData = z.object({
  totalCr: z.number(),
  totalDr: z.number(),
  balance: z.number(),
});

export type CashLedgerSummary = z.infer<typeof cashLedgerSummaryData>;

export const getCashLedgerSummaryResponseSchema = z.object({
  success: z.literal(true),
  data: cashLedgerSummaryData,
});

export type GetCashLedgerSummaryResponse = z.infer<
  typeof getCashLedgerSummaryResponseSchema
>;

export const createCashLedgerEntrySchema = z.object({
  date: z
    .string()
    .min(1, { error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      error: "Date must be in YYYY-MM-DD format",
    }),
  bsDate: z
    .string()
    .min(1, { error: "BS date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      error: "BS date must be in YYYY-MM-DD format",
    }),
  entryType: z.enum(["cr", "dr"], {
    error: "Entry type must be either CR or DR",
  }),
  amount: z
    .string()
    .min(1, { error: "Amount is required" })
    .refine((val) => !isNaN(Number(val)), { error: "Amount must be a number" })
    .refine((val) => Number(val) >= 0.01, {
      error: "Amount must be at least Rs 0.01",
    })
    .refine((val) => Number(val) <= 10000000, {
      error: "Amount must not exceed Rs. 1,00,00,000",
    }),
  description: z
    .string()
    .refine((val) => val === "" || val.length >= 5, {
      error: "Description must be at least 5 characters",
    })
    .refine((val) => val === "" || val.length <= 200, {
      error: "Description must not exceed 200 characters",
    })
    .transform((val) => (val === "" ? undefined : val)),
});

export const createcashLedgerEntryResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type CreateCashLedgerEntryInput = z.infer<
  typeof createCashLedgerEntrySchema
>;
export type CreateCashLedgerEntryResponse = z.infer<
  typeof createcashLedgerEntryResponseSchema
>;
