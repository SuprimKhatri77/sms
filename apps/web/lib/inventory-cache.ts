import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

// Every inventory list shows a product's category path, so any change to a
// category, or to which category a product is in, has to refresh all of them.
const INVENTORY_LIST_KEYS = [
  ["admin-inventory-products"],
  ["admin-inventory-purchase"],
  ["admin-inventory-sale"],
  ["admin-inventory-wastage"],
  ["admin-inventory-summary"],
] as const;

export function invalidateInventoryCategoryViews(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.productCategories.all });
  for (const queryKey of INVENTORY_LIST_KEYS) {
    queryClient.invalidateQueries({ queryKey });
  }
}
