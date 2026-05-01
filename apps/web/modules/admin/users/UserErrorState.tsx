"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

interface UsersErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function UsersErrorState({
  message = "Something went wrong while loading users.",
  onRetry,
}: UsersErrorStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 border border-[rgba(47,78,64,0.2)] bg-white px-6 py-20 text-center">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center border-2 border-[rgba(47,78,64,0.25)] bg-[rgba(194,138,79,0.12)]">
        <AlertTriangle size={28} strokeWidth={1.5} className="text-(--brand-brown)" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-sm">
        <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-(--brand-green)">
          Failed to load users
        </h3>
        <p className="font-mono text-xs leading-relaxed text-[rgba(47,78,64,0.55)]">
          {message}
        </p>
        <p className="font-mono text-xs leading-relaxed text-[rgba(47,78,64,0.45)]">
          Check your connection or try again. If this keeps happening, contact
          your system administrator.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-0 sm:flex-row">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 border border-(--brand-green) bg-(--brand-green) px-6 py-2.5 font-mono text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-(--brand-green-2)"
          >
            <RotateCcw size={12} />
            Retry
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 border border-[rgba(47,78,64,0.25)] border-l-0 bg-white px-6 py-2.5 font-mono text-xs font-semibold tracking-widest text-(--brand-green) uppercase transition-colors hover:bg-[rgba(47,78,64,0.05)] sm:border-l-0"
        >
          Reload page
        </button>
      </div>

      {/* Error detail strip */}
      <div className="w-full max-w-sm border border-[rgba(47,78,64,0.14)] bg-[rgba(47,78,64,0.02)] px-4 py-3 text-left">
        <p className="mb-1 font-mono text-xs tracking-widest text-[rgba(47,78,64,0.45)] uppercase">
          Error detail
        </p>
        <p className="font-mono text-xs break-all text-[rgba(47,78,64,0.65)]">{message}</p>
      </div>
    </div>
  );
}
