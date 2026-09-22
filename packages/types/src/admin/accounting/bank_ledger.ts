import z from "zod";
import { paginationMetaSchema } from "../../base";

const bankLedgerResponseData = z.object({
  id: z.uuid(),
  bankAccountID: z.uuid(),
  date: z.string(),
  bsDate: z.string(),
  entryType: z.enum(["dr", "cr"]),
  amount: z.number(),
  description: z.string().optional(),
  paymentID: z.uuid().optional(),
  createdAt: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  bankName: z.string(),
});

export type BankLedger = z.infer<typeof bankLedgerResponseData>;

export const getBankLedgerResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(bankLedgerResponseData),
  meta: paginationMetaSchema,
});

export type GetBankLedgerResponse = z.infer<typeof getBankLedgerResponseSchema>;

export const bankLedgerData = z.object({
  bankLedger: z.array(bankLedgerResponseData),
  meta: paginationMetaSchema,
});
export type BankLedgerData = z.infer<typeof bankLedgerData>;

const bankLedgerSummaryData = z.object({
  totalCr: z.number(),
  totalDr: z.number(),
  balance: z.number(),
});

export type BankLedgerSummary = z.infer<typeof bankLedgerSummaryData>;

export const getBankLedgerSummaryResponseSchema = z.object({
  success: z.literal(true),
  data: bankLedgerSummaryData,
});

export type GetBankLedgerSummaryRepsonse = z.infer<
  typeof getBankLedgerSummaryResponseSchema
>;

export const createBankLedgerEntrySchema = z.object({
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
    .refine((val) => Number(val) > 0, {
      error: "Amount must be greater than 0",
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

export const createBankLedgerEntryResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type CreateBankLedgerEntryInput = z.infer<
  typeof createBankLedgerEntrySchema
>;
export type CreateBankLedgerEntryResponse = z.infer<
  typeof createBankLedgerEntryResponseSchema
>;

const bankAccountForDropdown = z.object({
  id: z.uuid(),
  bankName: z.string(),
  accountName: z.string(),
  bankId: z.string(),
  isDefault: z.boolean(),
});

export type BankAccountForDropdown = z.infer<typeof bankAccountForDropdown>;

export const getBankAccountsForDropdownResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(bankAccountForDropdown),
});

export type GetBankAccountsForDropdownResponse = z.infer<
  typeof getBankAccountsForDropdownResponseSchema
>;
