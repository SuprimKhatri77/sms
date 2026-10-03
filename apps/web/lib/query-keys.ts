import type { EmployeeListParams } from "./api/employees";
import type { LedgerFilterParams } from "./api/ledgers";

export const queryKeys = {
  analytics: {
    all: ["admin-analytics"] as const,
    detail: (from?: string | null, to?: string | null) =>
      ["admin-analytics", from ?? null, to ?? null] as const,
  },
  bankAccounts: {
    all: ["admin-bank-accounts"] as const,
    list: (page: number) => ["admin-bank-accounts", "list", page] as const,
    details: (id: string) => ["admin-bank-accounts", "detail", id] as const,
    dropdown: ["admin-bank-accounts", "dropdown"] as const,
  },
  productCategories: {
    all: ["admin-inventory-categories"] as const,
  },
  primaryHeads: {
    all: ["admin-primary-heads"] as const,
  },
  accountGroups: {
    all: ["admin-account-groups"] as const,
  },
  banks: {
    all: ["admin-banks"] as const,
    detail: (id: string) => ["admin-banks", id] as const,
  },
  ledgers: {
    all: ["admin-ledgers"] as const,
    list: (filters: LedgerFilterParams) =>
      ["admin-ledgers", "list", filters] as const,
    summary: (filters: LedgerFilterParams) =>
      ["admin-ledgers", "summary", filters] as const,
  },
  suppliers: {
    all: ["admin-suppliers"] as const,
    list: (page: number) => ["admin-suppliers", "list", page] as const,
  },
  employees: {
    all: ["admin-employees"] as const,
    list: (params: EmployeeListParams) =>
      ["admin-employees", "list", params] as const,
  },
  batches: {
    all: ["admin-students", "batches"] as const,
    list: () => ["admin-students", "batches", "list"] as const,
  },
  certificates: {
    student: (studentId: string) =>
      ["admin-certificates", "student", studentId] as const,
  },
  studentFinance: {
    payments: (filters: {
      page: number;
      from: string;
      to: string;
      search: string;
    }) => ["admin-students", "payments", filters] as const,
    discounts: (filters: {
      page: number;
      from: string;
      to: string;
      search: string;
    }) => ["admin-students", "discounts", filters] as const,
    scholarships: (filters: {
      page: number;
      from: string;
      to: string;
      search: string;
    }) => ["admin-students", "scholarships", filters] as const,
  },
};
