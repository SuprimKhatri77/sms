"use client";

import { Inbox, RefreshCw, Filter } from "lucide-react";

interface Props {
  message?: string;
  code?: string;
  activeFilter?: string;
  onClearFilter?: () => void;
  onRetry?: () => void;
}

export default function InquiryEmpty({
  message,
  code,
  activeFilter,
  onClearFilter,
  onRetry,
}: Props) {
  const isFiltered = !!activeFilter && activeFilter !== "all";

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[420px] py-16 px-4">
      {/* Icon */}
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: "#6b9e6b", transform: "scale(1.6)" }}
        />
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center border-2"
          style={{ backgroundColor: "#f4f8f4", borderColor: "#6b9e6b33" }}
        >
          <Inbox
            className="w-10 h-10"
            style={{ color: "#6b9e6b" }}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {code && (
        <span
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 border"
          style={{
            backgroundColor: "#6b9e6b11",
            borderColor: "#6b9e6b33",
            color: "#6b9e6b",
          }}
        >
          {code}
        </span>
      )}

      <h2
        className="text-2xl font-bold text-center mb-2"
        style={{ color: "#2d4a3e", fontFamily: "Georgia, serif" }}
      >
        {isFiltered ? `No "${activeFilter}" inquiries` : "No inquiries yet"}
      </h2>

      <p
        className="text-center max-w-md text-sm leading-relaxed"
        style={{ color: "#7d6b8a" }}
      >
        {message ??
          (isFiltered
            ? `There are no inquiries matching the "${activeFilter}" filter. Try a different filter or check back later.`
            : "When visitors submit inquiries through your contact forms, they'll appear here.")}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {isFiltered && onClearFilter && (
          <button
            onClick={onClearFilter}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#2d4a3e", color: "#fff" }}
          >
            <Filter className="w-4 h-4" />
            Clear Filter
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border hover:opacity-80 active:scale-95"
            style={{
              borderColor: "#d6cbb8",
              color: "#2d4a3e",
              backgroundColor: "#fff",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      <div className="flex gap-2 mt-12 opacity-30">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 1 ? 10 : 6,
              height: i === 1 ? 10 : 6,
              backgroundColor: "#6b9e6b",
            }}
          />
        ))}
      </div>
    </div>
  );
}
