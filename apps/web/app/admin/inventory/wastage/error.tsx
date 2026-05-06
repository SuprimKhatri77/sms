"use client";

import WastageError from "@/modules/admin/inventory/wastage/WastageError";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <WastageError error={error} reset={reset} />;
}
