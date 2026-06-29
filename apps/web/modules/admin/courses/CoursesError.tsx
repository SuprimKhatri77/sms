"use client";

import { WifiOff, RotateCcw } from "lucide-react";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

interface CoursesErrorProps {
  onRetry: () => void;
}

export function CoursesError({ onRetry }: CoursesErrorProps) {
  return (
    <AdminPageLayout
      title="Courses"
      description="Manage available courses and their fees"
      maxWidth="wide"
    >
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 border border-[rgba(47,78,64,0.18)] bg-white px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center border border-[rgba(154,52,18,0.25)] bg-[rgba(154,52,18,0.08)] text-[#9a3412]">
          <WifiOff size={22} />
        </div>
        <div className="space-y-1">
          <h2 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
            Unable to reach the server
          </h2>
          <p className="max-w-xs font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
            Check your internet connection or try again. The server may be
            temporarily unavailable.
          </p>
        </div>
        <button onClick={onRetry} className={adminPrimaryButtonClass}>
          <RotateCcw size={14} />
          Retry
        </button>
      </div>
    </AdminPageLayout>
  );
}
