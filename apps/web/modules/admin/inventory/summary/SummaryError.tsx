"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
type Props = { error: { message: string }; reset: () => void };
export default function SummaryError({ error, reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center font-[var(--font-dm-sans)]">
      <AlertTriangle className="text-[var(--brand-brown)]" size={36} />
      <div>
        <p className="text-[var(--brand-ink)] font-semibold text-lg">
          Something went wrong
        </p>
        <p className="text-[var(--brand-ink)]/50 text-sm mt-1">
          {error.message}
        </p>
      </div>
      <Button
        onClick={reset}
        className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white"
      >
        Try Again
      </Button>
    </div>
  );
}
