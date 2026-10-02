import z from "zod";
import { paginationMetaSchema } from "../../base";

export const ledgerTypeValues = ["cash", "bank", "supplier"] as const;
export type LedgerType = (typeof ledgerTypeValues)[number];

/**
 * What each ledger type needs, mirroring the backend's pkg/ledger.Types.
 * Adding a ledger type is an entry here plus one there.
 */
export const LEDGER_TYPES: Record<
  LedgerType,
  {
    label: string;
    party: "none" | "bankAccount" | "supplier";
    /** can be tagged with an account group */
    accountGroup: boolean;
    /** a debit records how it was paid, and the matching cash/bank debit */
    paymentType: boolean;
  }
> = {
  cash: {
    label: "Cash",
    party: "none",
    accountGroup: false,
    paymentType: false,
  },
  bank: {
    label: "Bank",
    party: "bankAccount",
    accountGroup: false,
    paymentType: false,
  },
  supplier: {
    label: "Supplier",
    party: "supplier",
    accountGroup: true,
    paymentType: true,
  },
};

export const ledgerSourceValues = [
  "manual",
  "purchase",
  "student_payment",
  "supplier_payment",
] as const;
export type LedgerSource = (typeof ledgerSourceValues)[number];

const ledgerEntrySchema = z.object({
  id: z.uuid(),
  ledgerType: z.enum(ledgerTypeValues),
  source: z.enum(ledgerSourceValues),
  bankAccountId: z.uuid().nullable(),
  supplierId: z.uuid().nullable(),
  accountGroupId: z.uuid().nullable(),
  paymentId: z.uuid().nullable(),
  stockInId: z.uuid().nullable(),
  /** on the cash/bank side of a supplier payment: the supplier entry */
  pairedEntryId: z.uuid().nullable(),
  date: z.string(),
  bsDate: z.string(),
  entryType: z.enum(["cr", "dr"]),
  /** paisa */
  amount: z.number(),
  description: z.string().nullable(),
  paymentType: z.string().nullable(),
  createdAt: z.string(),
  supplierName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  accountGroupName: z.string().nullable(),
  /** on a supplier payment: its cash/bank side, if it's linked to one */
  counterEntryId: z.uuid().nullable(),
  /** on a supplier payment by bank: the account the money left from */
  paidFromAccountId: z.uuid().nullable(),
  paidFromAccountName: z.string().nullable(),
  paidFromBankName: z.string().nullable(),
});
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

export const getLedgerEntriesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(ledgerEntrySchema),
  meta: paginationMetaSchema,
});
export type GetLedgerEntriesResponse = z.infer<
  typeof getLedgerEntriesResponseSchema
>;

export const ledgerEntriesData = z.object({
  entries: z.array(ledgerEntrySchema),
  meta: paginationMetaSchema,
});
export type LedgerEntriesData = z.infer<typeof ledgerEntriesData>;

const ledgerSummarySchema = z.object({
  ledgerType: z.enum(ledgerTypeValues),
  /** paisa */
  totalCr: z.number(),
  totalDr: z.number(),
  /** credits minus debits */
  balance: z.number(),
});
export type LedgerSummary = z.infer<typeof ledgerSummarySchema>;

export const getLedgerSummaryResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(ledgerSummarySchema),
});
export type GetLedgerSummaryResponse = z.infer<
  typeof getLedgerSummaryResponseSchema
>;

export const ledgerEntryInputSchema = z
  .object({
    ledgerType: z.enum(ledgerTypeValues, { error: "Choose a ledger" }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      error: "AD date must be in YYYY-MM-DD format",
    }),
    bsDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      error: "Choose a date",
    }),
    entryType: z.enum(["cr", "dr"], { error: "Choose debit or credit" }),
    amount: z
      .number({ error: "Enter an amount" })
      .min(0.01, { error: "Amount must be at least Rs 0.01" })
      .lte(10000000, { error: "Amount must not exceed Rs. 1,00,00,000" }),
    description: z
      .string()
      .trim()
      .min(5, { error: "Narration must be at least 5 characters" })
      .max(200, { error: "Narration must be 200 characters or less" })
      .optional(),
    bankAccountID: z.uuid().optional(),
    supplierID: z.uuid().optional(),
    accountGroupID: z.uuid().optional(),
    paymentType: z
      .string()
      .trim()
      .min(2, { error: "Payment type is required" })
      .max(100, { error: "Payment type must be 100 characters or less" })
      .optional(),
    /** kept as-is when editing an entry that links to a purchase */
    stockInID: z.uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const spec = LEDGER_TYPES[data.ledgerType];
    if (spec.party === "bankAccount" && !data.bankAccountID) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a bank account",
        path: ["bankAccountID"],
      });
    }
    if (spec.party === "supplier" && !data.supplierID) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a supplier",
        path: ["supplierID"],
      });
    }
    // only a supplier payment (a debit) moves money, so only it needs a payment type
    if (spec.paymentType && data.entryType === "dr" && !data.paymentType) {
      ctx.addIssue({
        code: "custom",
        message: "Payment type is required",
        path: ["paymentType"],
      });
    }
  });
export type LedgerEntryInput = z.infer<typeof ledgerEntryInputSchema>;

export const ledgerEntryMutationResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: ledgerEntrySchema,
});
export type LedgerEntryMutationResponse = z.infer<
  typeof ledgerEntryMutationResponseSchema
>;

export const deleteLedgerEntryResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});
export type DeleteLedgerEntryResponse = z.infer<
  typeof deleteLedgerEntryResponseSchema
>;
