import { GetBankLedgerSummaryParams } from "./api/bank_ledger";

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
  banks: {
    all: ["admin-banks"] as const,
    detail: (id: string) => ["admin-banks", id] as const,
  },
  bankLedger: {
    all: ["admin-bank-ledger"] as const,
    list: (
      bankId?: string,
      accountId?: string,
      fromDate?: string | null,
      toDate?: string | null,
    ) =>
      ["admin-bank-ledger", "list", bankId, accountId, fromDate, toDate] as const,
    summary: ({
      accountID,
      bankID,
      fromDate,
      toDate,
    }: GetBankLedgerSummaryParams) =>
      [
        "admin-bank-ledger",
        "summary",
        accountID,
        bankID,
        fromDate,
        toDate,
      ] as const,
  },
  cashLedger: {
    all: ["admin-cash-ledger"] as const,
    list: (fromAD?: string | null, toAD?: string | null) =>
      ["admin-cash-ledger", "list", fromAD, toAD] as const,
    summary: (fromAD?: string | null, toAD?: string | null) =>
      ["admin-cash-ledger", "summary", fromAD, toAD] as const,
  },
  suppliers: {
    all: ["admin-suppliers"] as const,
    list: (page: number) => ["admin-suppliers", "list", page] as const,
    ledger: {
      summary: ({
        supplierID,
        fromDate,
        toDate,
      }: {
        supplierID: string | null;
        fromDate: string | null;
        toDate: string | null;
      }) =>
        [
          "admin-suppliers",
          "ledger",
          "summary",
          supplierID,
          fromDate,
          toDate,
        ] as const,
      list: (
        supplierID: string,
        page: number,
        fromDate: string | null,
        toDate: string | null,
      ) =>
        [
          "admin-suppliers",
          "ledger",
          "list",
          supplierID,
          page,
          fromDate,
          toDate,
        ] as const,
      all: ["admin-suppliers", "ledger"] as const,
    },
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
