"use client";

import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  success: false;
  message?: string;
  code?: string;
  onRetry?: () => void;
}

const CODE_HINTS: Record<string, string> = {
  DB_CONN_FAILED: "Database connection failed. Check your DB credentials.",
  UNAUTHORIZED: "You don't have permission to view this resource.",
  NOT_FOUND: "The requested resource could not be found.",
  VALIDATION_ERROR: "One or more fields failed validation.",
  RATE_LIMITED: "Too many requests. Please slow down.",
  INTERNAL: "Something went wrong on the server.",
};

export default function InquiryError({ message, code, onRetry }: Props) {
  const router = useRouter();
  const hint = code ? (CODE_HINTS[code] ?? null) : null;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[480px] py-16 px-4">
      {/* Decorative ring */}
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: "#e8552a", transform: "scale(1.4)" }}
        />
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center border-2"
          style={{ backgroundColor: "#fff7f5", borderColor: "#e8552a33" }}
        >
          <AlertTriangle
            className="w-10 h-10"
            style={{ color: "#e8552a" }}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Code badge */}
      {code && (
        <span
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 border"
          style={{
            backgroundColor: "#e8552a11",
            borderColor: "#e8552a33",
            color: "#e8552a",
          }}
        >
          ERR · {code}
        </span>
      )}

      <h2
        className="text-2xl font-bold text-center mb-2"
        style={{ color: "#2d4a3e", fontFamily: "Georgia, serif" }}
      >
        Something went wrong
      </h2>

      <p
        className="text-center max-w-md text-sm leading-relaxed mb-2"
        style={{ color: "#6b9e6b" }}
      >
        {message ?? "An unexpected error occurred while fetching inquiries."}
      </p>

      {hint && (
        <p
          className="text-center max-w-sm text-xs leading-relaxed mb-6 px-4 py-2 rounded-xl border"
          style={{
            color: "#7d6b8a",
            borderColor: "#7d6b8a22",
            backgroundColor: "#7d6b8a0a",
          }}
        >
          <Lightbulb /> {hint}
        </p>
      )}

      {!hint && <div className="mb-6" />}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#e8552a", color: "#fff" }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border hover:opacity-80 active:scale-95"
          style={{
            borderColor: "#d6cbb8",
            color: "#2d4a3e",
            backgroundColor: "#fff",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        <button
          onClick={() => router.push("/admin")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border hover:opacity-80 active:scale-95"
          style={{
            borderColor: "#d6cbb8",
            color: "#2d4a3e",
            backgroundColor: "#fff",
          }}
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      {/* Dev-only debug strip */}
      {process.env.NODE_ENV === "development" && (code ?? message) && (
        <div
          className="mt-10 w-full max-w-lg rounded-xl p-4 font-mono text-xs leading-relaxed border"
          style={{
            backgroundColor: "#1a1a1a",
            borderColor: "#333",
            color: "#e8552a",
          }}
        >
          <p className="text-gray-500 mb-1">{"// dev mode"}</p>
          {code && <p>code: &quot;{code}&quot;</p>}
          {message && <p>message: &quot;{message}&quot;</p>}
          <p>success: false</p>
        </div>
      )}
    </div>
  );
}
