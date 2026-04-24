"use client";

import { AlertCircle, CreditCard, X } from "lucide-react";
import { useState } from "react";

export function AddPaymentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (amount: number, remarks: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const n = Number(amount);
    if (!amount || isNaN(n) || n <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    onAdd(n, remarks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-black/[0.06] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3
            className="text-[1.1rem] font-semibold text-[#2d4a3e]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Add Payment
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#2d4a3e]/08"
          >
            <X className="h-4 w-4 text-[#2d4a3e]/50" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[0.78rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Amount (NPR) <span className="text-[#e8552a]">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2d4a3e]/40">
                <CreditCard className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-[0.92rem] text-[#2d4a3e] outline-none transition-all placeholder:text-[#2d4a3e]/30 focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15 ${error ? "border-red-400 ring-2 ring-red-100" : "border-[#2d4a3e]/15"}`}
                style={{ fontFamily: "var(--font-dm-sans)" }}
              />
            </div>
            {error && (
              <p
                className="flex items-center gap-1.5 text-[0.78rem] text-red-500"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[0.78rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Remarks{" "}
              <span className="font-normal normal-case text-[#2d4a3e]/40">
                (optional)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Second installment"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-[#2d4a3e]/15 bg-white py-3 px-4 text-[0.92rem] text-[#2d4a3e] outline-none transition-all placeholder:text-[#2d4a3e]/30 focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#2d4a3e]/15 py-3 text-[0.9rem] font-medium text-[#2d4a3e] transition-all hover:bg-[#2d4a3e]/05"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-[#2d4a3e] py-3 text-[0.9rem] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(45,74,62,0.25)]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Add Payment
          </button>
        </div>
      </div>
    </div>
  );
}
