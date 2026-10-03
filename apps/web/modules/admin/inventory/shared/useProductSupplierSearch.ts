import { useCallback } from "react";
import api from "@/lib/axios";
import {
  Employee,
  GetBankAccountsForDropdownResponse,
  GetBanksResponse,
  GetProductResponse,
  GetSupplierResponse,
} from "@repo/types";
import type { SearchableSelectOption } from "./SearchableSelect";
import { getEmployees } from "@/lib/api/employees";

export function useProductSearch() {
  return useCallback(
    async (q: string): Promise<SearchableSelectOption[]> => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "10");
      if (q) params.set("name", q);
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products?${params.toString()}`,
      );
      if (!res.data.success) return [];
      return res.data.data.map((p) => ({ value: p.id, label: p.name }));
    },
    [],
  );
}

// For sales and wastage: shows what's in stock right now next to each name,
// e.g. "Pant · 25 pieces in stock". The server still checks stock on the
// entry's date when it's saved.
export function useStockedProductSearch() {
  return useCallback(
    async (q: string): Promise<SearchableSelectOption[]> => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "10");
      if (q) params.set("name", q);
      const res = await api.get<GetProductResponse>(
        `/admin/inventory/products?${params.toString()}`,
      );
      if (!res.data.success) return [];
      return res.data.data.map((p) => ({
        value: p.id,
        label: `${p.name} · ${p.inStock} ${p.unit} in stock`,
      }));
    },
    [],
  );
}

export function useSupplierSearch() {
  return useCallback(
    async (q: string): Promise<SearchableSelectOption[]> => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "10");
      if (q) params.set("name", q);
      const res = await api.get<GetSupplierResponse>(
        `/admin/accounting/suppliers?${params.toString()}`,
      );
      if (!res.data.success) return [];
      return res.data.data.map((s) => ({ value: s.id, label: s.companyName }));
    },
    [],
  );
}

export function useBankAccountSearch() {
  return useCallback(
    async (q: string): Promise<SearchableSelectOption[]> => {
      const params = new URLSearchParams();
      params.set("limit", "5");
      if (q) params.set("name", q);
      const res = await api.get<GetBankAccountsForDropdownResponse>(
        `/admin/accounting/banks/accounts/dropdown?${params.toString()}`,
      );
      if (!res.data.success) return [];
      return res.data.data.map((a) => ({
        value: a.id,
        label: `${a.bankName} — ${a.accountName}`,
      }));
    },
    [],
  );
}

export function useBankSearch() {
  return useCallback(
    async (q: string): Promise<SearchableSelectOption[]> => {
      const params = new URLSearchParams();
      params.set("page", "1");
      if (q) params.set("name", q);
      const res = await api.get<GetBanksResponse>(
        `/admin/accounting/banks?${params.toString()}`,
      );
      if (!res.data.success) return [];
      return res.data.data.map((b) => ({ value: b.id, label: b.name }));
    },
    [],
  );
}

/** An employee as a picker shows them: the code tells apart people with the same name. */
export const employeeOptionLabel = (name: string, code: string) =>
  `${name} · ${code}`;

/**
 * Employees by name or code. With activeOnly, people marked inactive are left
 * out (nothing new is booked to them). onLoaded gets each page of results, so
 * a form can use more than the id and label of the one picked.
 */
export function useEmployeeSearch({
  activeOnly = false,
  onLoaded,
}: {
  activeOnly?: boolean;
  onLoaded?: (employees: Employee[]) => void;
} = {}) {
  return useCallback(
    async (q: string): Promise<SearchableSelectOption[]> => {
      const { employees } = await getEmployees({
        page: 1,
        q,
        status: activeOnly ? "active" : "",
        limit: 10,
      });
      onLoaded?.(employees);
      return employees.map((e) => ({
        value: e.id,
        label: employeeOptionLabel(e.fullName, e.code),
      }));
    },
    [activeOnly, onLoaded],
  );
}
