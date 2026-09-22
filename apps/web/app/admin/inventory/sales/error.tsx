"use client";

import SaleError from "@/modules/admin/inventory/sales/SaleError";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <SaleError error={error} reset={reset} />;
}
