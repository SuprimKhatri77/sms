"use client";

import StockOutError from "@/modules/admin/inventory/stock-out/StockOutError";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <StockOutError error={error} reset={reset} />;
}
