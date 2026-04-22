"use client";

import { Users } from "lucide-react";

interface UsersEmptyStateProps {
  onCreateUser: () => void;
}

export function UsersEmptyState({ onCreateUser }: UsersEmptyStateProps) {
  return (
    <div className="border border-black border-dashed w-full py-20 px-6 flex flex-col items-center justify-center gap-6 text-center">
      {/* Icon */}
      <div className="w-16 h-16 border-2 border-black flex items-center justify-center bg-zinc-50">
        <Users size={28} strokeWidth={1.5} className="text-black" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-xs">
        <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-black">
          No users found
        </h3>
        <p className="font-mono text-xs text-zinc-500 leading-relaxed">
          There are no users in the system yet. Create the first one to get
          started.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onCreateUser}
        className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 font-mono text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors border border-black"
      >
        + Create First User
      </button>
    </div>
  );
}
