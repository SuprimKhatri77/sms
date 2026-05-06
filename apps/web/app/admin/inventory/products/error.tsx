"use client";

import StockInError from "@/modules/admin/inventory/stock-in/StockInError";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <StockInError error={error} reset={reset} />;
}
