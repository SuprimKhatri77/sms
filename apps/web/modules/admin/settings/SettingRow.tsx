"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

interface Setting {
  key: string;
  value: string;
}

interface SettingRowProps {
  setting: Setting;
  onSave: (key: string, value: string) => void;
}

const LABEL_MAP: Record<string, string> = {
  ref_prefix: "Reference Prefix",
  fiscal_year: "Fiscal Year",
};

function formatKey(key: string): string {
  return (
    LABEL_MAP[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function SettingRow({ setting, onSave }: SettingRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(setting.value);

  const handleSave = () => {
    if (draft.trim()) {
      onSave(setting.key, draft.trim());
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setDraft(setting.value);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-stone-200 last:border-b-0 hover:bg-stone-50 transition-colors flex-wrap">
      {/* Meta */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-semibold text-stone-800">
          {formatKey(setting.key)}
        </span>
        <span className="font-mono-dm text-[0.7rem] text-stone-400 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 w-fit">
          {setting.key}
        </span>
      </div>

      {/* Control */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              className="font-mono-dm border-2 border-blue-500 rounded-lg px-2.5 py-1.5 text-sm outline-none bg-white text-stone-800 w-40 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-shadow"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
            />
            <button
              onClick={handleSave}
              title="Save"
              className="w-[30px] h-[30px] rounded-md border-0 grid place-items-center cursor-pointer bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex-shrink-0"
            >
              <Check size={15} />
            </button>
            <button
              onClick={handleCancel}
              title="Cancel"
              className="w-[30px] h-[30px] rounded-md border-0 grid place-items-center cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="font-mono-dm text-sm font-medium text-stone-800 bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5">
              {setting.value}
            </span>
            <button
              onClick={() => {
                setDraft(setting.value);
                setEditing(true);
              }}
              title="Edit"
              className="w-[30px] h-[30px] rounded-md border border-stone-200 bg-white grid place-items-center cursor-pointer text-stone-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500 transition-all flex-shrink-0"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
