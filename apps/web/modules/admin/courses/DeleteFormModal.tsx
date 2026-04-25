"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

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
      className="fixed inset-0 z-50 bg-black/35 grid place-items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[380px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 justify-between px-5 py-[1.1rem] border-b border-gray-200">
          <div className="text-red-600">
            <AlertTriangle size={18} />
          </div>
          <h2 className="text-base font-bold flex-1">Delete Course</h2>
          <button
            className="w-[30px] h-[30px] rounded-md border border-gray-200 grid place-items-center cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-gray-500">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900">{courseName}</strong>? This action
            cannot be undone.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            className="inline-flex items-center gap-[0.4rem] bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 text-[0.8125rem] font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-[0.4rem] bg-red-600 text-white border-0 rounded-lg px-4 py-2 text-[0.8125rem] font-semibold cursor-pointer hover:bg-red-700 transition-colors"
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
        .animate-fade-in { animation: fade-in .15s ease; }
        .animate-slide-up { animation: slide-up .18s ease; }
      `}</style>
    </div>
  );
}
