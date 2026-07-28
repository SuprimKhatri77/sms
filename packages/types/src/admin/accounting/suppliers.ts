import z from "zod";
import { paginationMetaSchema } from "../../base";

const supplierSchema = z.object({
  id: z.uuid(),
  companyName: z.string(),
  vatNo: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.string(),
});

export type Supplier = z.infer<typeof supplierSchema>;

export const getSupplierResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(supplierSchema),
  meta: paginationMetaSchema,
});

export type GetSupplierResponse = z.infer<typeof getSupplierResponseSchema>;

const suppliersData = z.object({
  suppliers: z.array(supplierSchema),
  meta: paginationMetaSchema,
});

export type SuppliersData = z.infer<typeof suppliersData>;

export const createSupplierSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  vatNo: z
    .string()
    .regex(/^[0-9]{9}$/, "Enter a valid VAT number")
    .max(9, "VAT number must be 9 digits")
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter a valid phone number")
    .optional(),
});
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const createSupplierResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type CreateSupplierResponse = z.infer<
  typeof createSupplierResponseSchema
>;

export const updateSupplierSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  vatNo: z
    .string()
    .regex(/^[0-9]{9}$/, "Enter a valid VAT number")
    .max(9, "VAT number must be 9 digits")
    .nullable()
    .transform((val) => val ?? undefined),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter a valid phone number")
    .nullable()
    .transform((val) => val ?? undefined),
});
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export const updateSupplierResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});
export type UpdateSupplierResponse = z.infer<
  typeof updateSupplierResponseSchema
>;

export const deleteSupplierResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type DeleteSupplierResponse = z.infer<
  typeof deleteSupplierResponseSchema
>;
