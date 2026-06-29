"use client";

import type { AxiosError } from "axios";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { inventoryTableWrapClass } from "../shared/inventory-styles";

type ProductsErrorProps = {
  error: Error | AxiosError | unknown;
  reset: () => void;
};

function resolveErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosErr = error as AxiosError<{ message?: string }>;
    const serverMessage = axiosErr.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (axiosErr.message) return axiosErr.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}

export function ProductsError({ error, reset }: ProductsErrorProps) {
  return (
    <div className={inventoryTableWrapClass}>
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-green)">
          Failed to load products
        </h2>
        <p className="max-w-sm font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
          {resolveErrorMessage(error)}
        </p>
        <button type="button" onClick={reset} className={adminPrimaryButtonClass}>
          Try Again
        </button>
      </div>
    </div>
  );
}
