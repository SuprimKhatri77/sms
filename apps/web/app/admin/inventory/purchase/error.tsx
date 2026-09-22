"use client";

import PurchaseError from "@/modules/admin/inventory/purchase/PurchaseError";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <PurchaseError error={error} reset={reset} />;
}
