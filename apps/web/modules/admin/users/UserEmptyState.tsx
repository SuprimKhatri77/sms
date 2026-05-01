"use client";

import { Users } from "lucide-react";

interface UsersEmptyStateProps {
  onCreateUser: () => void;
}

export function UsersEmptyState({ onCreateUser }: UsersEmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 border border-dashed border-[rgba(47,78,64,0.25)] px-6 py-20 text-center bg-white">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center border-2 border-[rgba(47,78,64,0.25)] bg-[rgba(47,78,64,0.06)]">
        <Users size={28} strokeWidth={1.5} className="text-(--brand-green)" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-xs">
        <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-(--brand-green)">
          No users found
        </h3>
        <p className="font-mono text-xs leading-relaxed text-[rgba(47,78,64,0.55)]">
          There are no users in the system yet. Create the first one to get
          started.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onCreateUser}
        className="inline-flex items-center gap-2 border border-(--brand-brown) bg-(--brand-brown) px-6 py-2.5 font-mono text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-[#ad7843]"
      >
        + Create First User
      </button>
    </div>
  );
}
