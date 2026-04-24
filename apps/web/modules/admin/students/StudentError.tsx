// components/admin/students-error.tsx
"use client";

import {
  RefreshCw,
  Home,
  WifiOff,
  ShieldAlert,
  ServerCrash,
  SearchX,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiError {
  message: string;
  code?: string;
}

interface StudentsErrorProps {
  error: ApiError;
  onRetry: () => void;
  variant?: "list" | "detail";
}

// ─── Code config ─────────────────────────────────────────────────────────────

function getErrorConfig(code: string) {
  switch (code) {
    case "UNAUTHORIZED":
      return {
        icon: ShieldAlert,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        title: "Session Expired",
        description:
          "Your session has expired. Please log in again to continue.",
        showRetry: false,
        showLogin: true,
      };

    case "FORBIDDEN":
      return {
        icon: ShieldAlert,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        title: "Access Denied",
        description:
          "You don't have permission to view this. Contact your administrator.",
        showRetry: false,
        showLogin: false,
      };

    case "NOT_FOUND":
      return {
        icon: SearchX,
        iconBg: "bg-[#2d4a3e]/08",
        iconColor: "text-[#2d4a3e]/40",
        title: "Not Found",
        description:
          "The resource you're looking for doesn't exist or may have been deleted.",
        showRetry: false,
        showLogin: false,
      };

    case "NETWORK_ERROR":
      return {
        icon: WifiOff,
        iconBg: "bg-red-50",
        iconColor: "text-red-400",
        title: "No Connection",
        description:
          "Unable to reach the server. Check your internet connection and try again.",
        showRetry: true,
        showLogin: false,
      };

    case "INTERNAL_SERVER_ERROR":
    case "SERVER_ERROR":
      return {
        icon: ServerCrash,
        iconBg: "bg-red-50",
        iconColor: "text-red-400",
        title: "Server Error",
        description: "Something went wrong on our end. Try again in a moment.",
        showRetry: true,
        showLogin: false,
      };

    default:
      return {
        icon: ServerCrash,
        iconBg: "bg-red-50",
        iconColor: "text-red-400",
        title: "Something Went Wrong",
        description: "An unexpected error occurred. Try again or go back.",
        showRetry: true,
        showLogin: false,
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentsError({
  error,
  onRetry,
  variant = "list",
}: StudentsErrorProps) {
  const config = getErrorConfig(error.code ?? "UNKNOWN_ERROR");
  const Icon = config.icon;

  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center px-6 py-16 text-center">
      {/* Icon */}
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.06] ${config.iconBg}`}
      >
        <Icon className={`h-7 w-7 ${config.iconColor}`} strokeWidth={1.75} />
      </div>

      {/* Code pill */}
      <span
        className="mb-4 inline-block rounded-full border border-[#2d4a3e]/10 bg-[#2d4a3e]/05 px-3 py-1 font-mono text-[0.72rem] font-semibold text-[#2d4a3e]/40"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {error.code}
      </span>

      {/* Title */}
      <h2
        className="mb-2 text-[1.2rem] font-bold text-[#2d4a3e]"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {config.title}
      </h2>

      {/* Description */}
      <p
        className="mb-1 max-w-[360px] text-[0.9rem] leading-[1.65] text-[#2d4a3e]/55"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {config.description}
      </p>

      {/* Raw server message */}
      {error.message && (
        <p
          className="mb-6 mt-1 max-w-[360px] font-mono text-[0.75rem] text-[#2d4a3e]/30"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {error.message}
        </p>
      )}

      {!error.message && <div className="mb-6" />}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {config.showRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d4a3e] px-5 py-2.5 text-[0.88rem] font-semibold text-white shadow-[0_4px_16px_rgba(45,74,62,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(45,74,62,0.3)]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            Try Again
          </button>
        )}

        {config.showLogin && (
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e8552a] px-5 py-2.5 text-[0.88rem] font-semibold text-white shadow-[0_4px_16px_rgba(232,85,42,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(232,85,42,0.35)]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Log In Again
          </Link>
        )}

        <Link
          href={variant === "detail" ? "/admin/students" : "/admin"}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2d4a3e]/15 bg-white px-5 py-2.5 text-[0.88rem] font-medium text-[#2d4a3e] transition-all duration-200 hover:border-[#2d4a3e]/30 hover:bg-[#2d4a3e]/05"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <Home className="h-3.5 w-3.5" strokeWidth={1.75} />
          {variant === "detail" ? "Back to Students" : "Back to Dashboard"}
        </Link>
      </div>
    </div>
  );
}
