"use client";

import { Button } from "@/components/ui/button";
import type { AxiosError } from "axios";

type ProductsErrorProps = {
  // TanStack Query types error as Error, but axios throws AxiosError.
  // We also call this manually when success: false, passing a plain message.
  error: Error | AxiosError | unknown;
  reset: () => void;
};

function resolveErrorMessage(error: unknown): string {
  // Axios error — has a response body
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosErr = error as AxiosError<{ message?: string; code?: string }>;
    const serverMessage = axiosErr.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (axiosErr.message) return axiosErr.message;
  }

  // Plain Error
  if (error instanceof Error) return error.message;

  // Fallback
  return "An unexpected error occurred. Please try again.";
}

export function ProductsError({ error, reset }: ProductsErrorProps) {
  const message = resolveErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Message */}
      <div className="space-y-2 max-w-sm">
        <h2
          className="text-xl font-semibold text-[var(--brand-ink)]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Failed to load products
        </h2>
        <p
          className="text-sm text-[var(--brand-ink)]/60"
          style={{ fontFamily: "var(--font-lora)" }}
        >
          {message}
        </p>
      </div>

      {/* Retry — calls refetch() */}
      <Button
        onClick={reset}
        className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white px-6"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Try Again
      </Button>
    </div>
  );
}
