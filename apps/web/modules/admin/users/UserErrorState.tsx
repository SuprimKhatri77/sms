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
    <div className="border border-black w-full py-20 px-6 flex flex-col items-center justify-center gap-6 text-center bg-zinc-50">
      {/* Icon */}
      <div className="w-16 h-16 border-2 border-black flex items-center justify-center bg-white">
        <AlertTriangle size={28} strokeWidth={1.5} className="text-black" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-sm">
        <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-black">
          Failed to load users
        </h3>
        <p className="font-mono text-xs text-zinc-500 leading-relaxed">
          {message}
        </p>
        <p className="font-mono text-xs text-zinc-400 leading-relaxed">
          Check your connection or try again. If this keeps happening, contact
          your system administrator.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 font-mono text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors border border-black"
          >
            <RotateCcw size={12} />
            Retry
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 font-mono text-xs font-semibold tracking-widest uppercase hover:bg-zinc-100 transition-colors border border-black border-l-0 sm:border-l-0"
        >
          Reload page
        </button>
      </div>

      {/* Error detail strip */}
      <div className="w-full max-w-sm border border-zinc-200 bg-white px-4 py-3 text-left">
        <p className="font-mono text-xs text-zinc-400 tracking-widest uppercase mb-1">
          Error detail
        </p>
        <p className="font-mono text-xs text-zinc-600 break-all">{message}</p>
      </div>
    </div>
  );
}
