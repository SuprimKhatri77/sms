// components/admin/courses/courses-unavailable.tsx
"use client";

import { ServerCrash, RotateCcw } from "lucide-react";

interface CoursesUnavailableProps {
  message?: string;
  onRetry: () => void;
}

export function CoursesUnavailable({
  message,
  onRetry,
}: CoursesUnavailableProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-500">
        <ServerCrash size={22} />
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-semibold text-amber-700">
          Something went wrong
        </h2>
        <p className="max-w-xs text-sm text-amber-600">
          {message ??
            "The server responded but couldn't return the courses. Please try again."}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 active:scale-95"
      >
        <RotateCcw size={14} />
        Retry
      </button>
    </div>
  );
}
