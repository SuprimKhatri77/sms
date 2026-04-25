"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";

interface AddSettingModalProps {
  onAdd: (key: string, value: string) => void;
  onClose: () => void;
  existingKeys: string[];
}

export function AddSettingModal({
  onAdd,
  onClose,
  existingKeys,
}: AddSettingModalProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
    const trimmedValue = value.trim();

    if (!trimmedKey) return setError("Key is required.");
    if (!trimmedValue) return setError("Value is required.");
    if (existingKeys.includes(trimmedKey))
      return setError("This key already exists.");

    onAdd(trimmedKey, trimmedValue);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/35 grid place-items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.08)] w-full max-w-[420px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-[1.1rem] border-b border-stone-200">
          <h2 className="text-base font-bold text-stone-800">Add Setting</h2>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-md border-0 grid place-items-center cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-stone-500">
            Key
            <input
              className="font-mono-dm border-2 border-blue-500 rounded-lg px-2.5 py-1.5 text-sm outline-none bg-white text-stone-800 w-full focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-shadow"
              placeholder="e.g. site_name"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError("");
              }}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-stone-500">
            Value
            <input
              className="font-mono-dm border-2 border-blue-500 rounded-lg px-2.5 py-1.5 text-sm outline-none bg-white text-stone-800 w-full focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-shadow"
              placeholder="e.g. My Site"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </label>
          {error && <p className="text-[0.78rem] text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 bg-white text-stone-800 border border-stone-200 rounded-lg px-4 py-2 text-[0.8125rem] font-medium cursor-pointer hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white border-0 rounded-lg px-4 py-2 text-[0.8125rem] font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <Save size={15} /> Save Setting
          </button>
        </div>
      </div>
    </div>
  );
}
