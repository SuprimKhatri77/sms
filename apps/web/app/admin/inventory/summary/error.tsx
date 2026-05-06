"use client";

import SummaryError from "@/modules/admin/inventory/summary/SummaryError";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <SummaryError error={error} reset={reset} />;
}
