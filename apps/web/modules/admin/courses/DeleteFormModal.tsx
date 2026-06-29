"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";

interface DeleteConfirmProps {
  courseName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({
  courseName,
  onConfirm,
  onClose,
}: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid animate-[fade-in_0.15s_ease] place-items-center bg-black/35 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] animate-[slide-up_0.18s_ease] border border-[rgba(47,78,64,0.18)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
          <div className="text-[#9a3412]">
            <AlertTriangle size={18} />
          </div>
          <h2 className="flex-1 font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
            Delete Course
          </h2>
          <button
            className="grid h-8 w-8 cursor-pointer place-items-center border border-[rgba(47,78,64,0.18)] text-[rgba(47,78,64,0.55)] transition-colors hover:bg-[rgba(47,78,64,0.04)]"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed text-[rgba(47,78,64,0.55)]">
            Are you sure you want to delete{" "}
            <strong className="text-(--brand-ink)">{courseName}</strong>? This
            action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-[rgba(47,78,64,0.12)] px-5 py-4">
          <button className={adminSecondaryButtonClass} onClick={onClose}>
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 border border-[#9a3412] bg-[#9a3412] px-4 py-2 font-[family-name:var(--font-dm-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#7c2d12]"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-up { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  );
}
