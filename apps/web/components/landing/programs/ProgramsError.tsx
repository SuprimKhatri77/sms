"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  landingPrimaryButtonClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "../landing-styles";

type ProgramsErrorProps = {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
};

export default function ProgramsError({
  message = "Failed to load programs.",
  onRetry,
  isRetrying = false,
}: ProgramsErrorProps) {
  return (
    <section
      id="programs"
      className="relative overflow-hidden bg-(--brand-cream) px-6 py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(47,78,64,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,78,64,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto flex max-w-lg flex-col items-center px-2 py-4 text-center">
        <div className="mb-4 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className={`${landingSectionTitleClass} mb-2 text-[1.5rem]`}>
          Unable to load programs
        </h3>
        <p className={`${landingSectionBodyClass} mb-6`}>{message}</p>
        <Button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className={`${landingPrimaryButtonClass} gap-2`}
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Retrying..." : "Try Again"}
        </Button>
      </div>
    </section>
  );
}
