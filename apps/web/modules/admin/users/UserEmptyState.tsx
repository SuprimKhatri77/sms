"use client";

import { Users } from "lucide-react";

import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";

interface UsersEmptyStateProps {
  onCreateUser: () => void;
  role: "admin" | "student" | "instructor" | "users";
}

export function UsersEmptyState({ onCreateUser, role }: UsersEmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 border border-dashed border-[rgba(47,78,64,0.25)] bg-white px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.04)]">
        <Users size={26} strokeWidth={1.5} className="text-(--brand-green)" />
      </div>

      <div className="max-w-xs space-y-2">
        <h3 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
          No {role} found
        </h3>
        <p className="font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed text-[rgba(47,78,64,0.55)]">
          There are no {role} in the system yet. Create the first one to get
          started.
        </p>
      </div>

      <button onClick={onCreateUser} className={adminPrimaryButtonClass}>
        + Create First {role}
      </button>
    </div>
  );
}
