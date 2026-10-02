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

// A purchase, sale or wastage reflows the FIFO batch links of its product, so
// costs on other sales/wastage, purchase "remaining", product "in stock" and
// the summary can all change with it.
export function invalidateInventoryStockViews(queryClient: QueryClient) {
  for (const queryKey of INVENTORY_LIST_KEYS) {
    queryClient.invalidateQueries({ queryKey });
  }
}

// A purchase also records (or updates, or removes) its supplier's ledger
// credit.
export function invalidatePurchaseViews(queryClient: QueryClient) {
  invalidateInventoryStockViews(queryClient);
  queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
}

export function invalidateInventoryCategoryViews(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.productCategories.all });
  for (const queryKey of INVENTORY_LIST_KEYS) {
    queryClient.invalidateQueries({ queryKey });
  }
}
