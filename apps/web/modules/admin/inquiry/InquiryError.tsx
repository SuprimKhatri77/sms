"use client";

import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";

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
    <AdminPageLayout
      title="Inquiries"
      description="Manage and respond to visitor submissions"
      maxWidth="wide"
    >
      <div className="flex min-h-[50vh] flex-col items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white px-6 py-16 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border border-[rgba(194,138,79,0.3)] bg-[rgba(194,138,79,0.08)]">
          <AlertTriangle className="h-7 w-7 text-(--brand-brown)" strokeWidth={1.5} />
        </div>

        {code && (
          <span className="mb-4 inline-flex items-center gap-1.5 border border-[rgba(194,138,79,0.3)] bg-[rgba(194,138,79,0.08)] px-3 py-1 font-mono text-[10px] font-semibold tracking-widest text-(--brand-brown) uppercase">
            ERR · {code}
          </span>
        )}

        <h2 className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-green)">
          Something went wrong
        </h2>

        <p className="mt-2 max-w-md font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed text-[rgba(47,78,64,0.55)]">
          {message ?? "An unexpected error occurred while fetching inquiries."}
        </p>

        {hint && (
          <p className="mt-4 max-w-sm border border-[rgba(47,78,64,0.12)] bg-[rgba(251,250,247,0.9)] px-4 py-2 font-[family-name:var(--font-dm-sans)] text-xs leading-relaxed text-[rgba(47,78,64,0.55)]">
            <Lightbulb className="mr-1 inline h-3.5 w-3.5" />
            {hint}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button onClick={onRetry} className={adminPrimaryButtonClass}>
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
          <button
            onClick={() => router.back()}
            className={adminSecondaryButtonClass}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => router.push("/admin")}
            className={adminSecondaryButtonClass}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (code ?? message) && (
          <div className="mt-10 w-full max-w-lg border border-[#333] bg-[#1a1a1a] p-4 text-left font-mono text-xs leading-relaxed text-(--brand-brown)">
            <p className="mb-1 text-gray-500">{"// dev mode"}</p>
            {code && <p>code: &quot;{code}&quot;</p>}
            {message && <p>message: &quot;{message}&quot;</p>}
            <p>success: false</p>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
