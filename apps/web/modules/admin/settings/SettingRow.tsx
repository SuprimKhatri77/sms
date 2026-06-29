"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

import {
  adminIconButtonClass,
  adminDangerIconButtonClass,
  adminInputClass,
} from "@/components/admin/admin-styles";

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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(47,78,64,0.08)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[rgba(47,78,64,0.02)]">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
          {formatKey(setting.key)}
        </span>
        <span className="w-fit border border-[rgba(47,78,64,0.12)] bg-[rgba(251,250,247,0.9)] px-1.5 py-0.5 font-mono text-[10px] text-[rgba(47,78,64,0.45)]">
          {setting.key}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              className={`${adminInputClass} w-40`}
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
              className={adminIconButtonClass}
            >
              <Check size={15} />
            </button>
            <button
              onClick={handleCancel}
              title="Cancel"
              className={adminDangerIconButtonClass}
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="border border-[rgba(47,78,64,0.12)] bg-[rgba(251,250,247,0.9)] px-3 py-1.5 font-mono text-sm font-medium text-(--brand-ink)">
              {setting.value}
            </span>
            <button
              onClick={() => {
                setDraft(setting.value);
                setEditing(true);
              }}
              title="Edit"
              className={adminIconButtonClass}
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
