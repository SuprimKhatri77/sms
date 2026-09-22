import { useCallback } from "react";
import api from "@/lib/axios";
import { GetProductResponse, GetSupplierResponse } from "@repo/types";
import type { SearchableSelectOption } from "./SearchableSelect";

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
