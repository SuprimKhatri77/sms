import { InventoryTransactionPageSkeleton } from "@/modules/admin/inventory/shared/InventoryTransactionPageSkeleton";

export default function Loading() {
  return (
    <InventoryTransactionPageSkeleton
      title="Stock In"
      description="Track all incoming inventory and purchase records."
      actionWidth="w-36"
      variant="stock-in-out"
    />
  );
}
