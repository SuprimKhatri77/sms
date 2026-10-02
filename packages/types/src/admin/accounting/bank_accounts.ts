import z from "zod";
import { paginationMetaSchema } from "../../base";

const bankAccountSchema = z.object({
  id: z.uuid(),
  bankName: z.string(),
  accountName: z.string(),
  accountNumber: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.string(),
});

export type BankAccount = z.infer<typeof bankAccountSchema>;

export const getBankAccountResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(bankAccountSchema),
  meta: paginationMetaSchema,
});
export type GetBankAccountResponse = z.infer<
  typeof getBankAccountResponseSchema
>;

export const bankAccountDataSchema = z.object({
  bankAccounts: z.array(bankAccountSchema),
  meta: paginationMetaSchema,
});

export type BankAccountsData = z.infer<typeof bankAccountDataSchema>;

export const createBankAccountInputSchema = z.object({
  accountName: z.string().trim().min(2).max(100),
  accountNumber: z
    .string()
    .regex(/^\d{9,20}$/, "Account number must be between 9 and 20 digits")
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});
export type CreateBankAccountInput = z.infer<
  typeof createBankAccountInputSchema
>;

export const createBankAccountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type CreateBankAccountResponse = z.infer<
  typeof createBankAccountResponseSchema
>;

export const updateBankAccountInputSchema = z.object({
  accountName: z.string().trim().min(2).max(100),
  accountNumber: z
    .string()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});
export type UpdateBankAccountInput = z.infer<
  typeof updateBankAccountInputSchema
>;
export const updateBankAccountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type UpdateBankAccountResponse = z.infer<
  typeof updateBankAccountResponseSchema
>;

export const deleteBankAccountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type DeleteBankAccountResponse = z.infer<
  typeof deleteBankAccountResponseSchema
>;

export const setDefaultBankAccountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type SetDefaultBankAccountResponse = z.infer<
  typeof setDefaultBankAccountResponseSchema
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
