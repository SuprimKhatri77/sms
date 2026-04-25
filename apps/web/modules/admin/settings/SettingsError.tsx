"use client";

import { WifiOff, RotateCcw } from "lucide-react";

interface SettingsErrorProps {
  onRetry: () => void;
}

export function SettingsError({ onRetry }: SettingsErrorProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 p-8 text-center min-h-screen">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
        <WifiOff size={22} />
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-semibold text-red-700">
          Unable to reach the server
        </h2>
        <p className="max-w-xs text-sm text-red-500">
          Check your internet connection or try again. The server may be
          temporarily unavailable.
        </p>
      </div>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:scale-95"
      >
        <RotateCcw size={14} />
        Retry
      </button>
    </div>
  );
}
