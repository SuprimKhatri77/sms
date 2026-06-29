import { InventoryTransactionPageSkeleton } from "@/modules/admin/inventory/shared/InventoryTransactionPageSkeleton";

export default function Loading() {
  return (
    <InventoryTransactionPageSkeleton
      title="Stock Out"
      description="Record outgoing inventory and sales."
      actionWidth="w-36"
      variant="stock-in-out"
    />
  );
}
