"use client";

import { ServerCrash, RotateCcw } from "lucide-react";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

interface CoursesUnavailableProps {
  message?: string;
  onRetry: () => void;
}

export function CoursesUnavailable({
  message,
  onRetry,
}: CoursesUnavailableProps) {
  return (
    <AdminPageLayout
      title="Courses"
      description="Manage available courses and their fees"
      maxWidth="wide"
    >
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 border border-[rgba(194,138,79,0.25)] bg-[rgba(194,138,79,0.06)] px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center border border-[rgba(194,138,79,0.3)] bg-white text-(--brand-brown)">
          <ServerCrash size={22} />
        </div>
        <div className="space-y-1">
          <h2 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
            Something went wrong
          </h2>
          <p className="max-w-xs font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
            {message ??
              "The server responded but couldn't return the courses. Please try again."}
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
