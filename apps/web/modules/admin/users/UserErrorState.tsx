"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from "@/components/admin/admin-styles";

interface UsersErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function UsersErrorState({
  message = "Something went wrong while loading users.",
  onRetry,
}: UsersErrorStateProps) {
  return (
    <AdminPageLayout
      title="Users"
      description="Manage admin accounts and roles"
      maxWidth="wide"
    >
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 border border-[rgba(47,78,64,0.18)] bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center border border-[rgba(194,138,79,0.3)] bg-[rgba(194,138,79,0.08)]">
          <AlertTriangle
            size={26}
            strokeWidth={1.5}
            className="text-(--brand-brown)"
          />
        </div>

        <div className="max-w-sm space-y-2">
          <h3 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
            Failed to load users
          </h3>
          <p className="font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed text-[rgba(47,78,64,0.55)]">
            {message}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button onClick={onRetry} className={adminPrimaryButtonClass}>
              <RotateCcw size={12} />
              Retry
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className={adminSecondaryButtonClass}
          >
            Reload page
          </button>
        </div>
      </div>
    </AdminPageLayout>
  );
}
