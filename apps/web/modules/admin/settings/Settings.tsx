"use client";

import { useState } from "react";
import {
  Settings,
  Plus,
  Pencil,
  Check,
  X,
  Save,
  ChevronRight,
} from "lucide-react";

const GLOBAL_STYLES = `
  @keyframes fade-in  { from { opacity: 0 }               to { opacity: 1 } }
  @keyframes slide-up { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }

  .animate-fade-in  { animation: fade-in  0.15s ease; }
  .animate-slide-up { animation: slide-up 0.18s ease; }
`;

interface Setting {
  key: string;
  value: string;
}

const INITIAL_SETTINGS: Setting[] = [
  { key: "ref_prefix", value: "BKC" },
  { key: "fiscal_year", value: "082/083" },
];

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

// ---------------------------------------------------------------------------
// SettingRow
// ---------------------------------------------------------------------------
interface SettingRowProps {
  setting: Setting;
  onSave: (key: string, value: string) => void;
}

function SettingRow({ setting, onSave }: SettingRowProps) {
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

// ---------------------------------------------------------------------------
// AddSettingModal
// ---------------------------------------------------------------------------
interface AddSettingModalProps {
  onAdd: (key: string, value: string) => void;
  onClose: () => void;
  existingKeys: string[];
}

function AddSettingModal({
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

// ---------------------------------------------------------------------------
// SettingsPage
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>(INITIAL_SETTINGS);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s)),
    );
  };

  const handleAdd = (key: string, value: string) => {
    setSettings((prev) => [...prev, { key, value }]);
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div className="min-h-screen bg-stone-100 px-4 py-8">
        <div className="max-w-[760px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-stone-400 mb-6">
            <span className="text-stone-500">Admin</span>
            <ChevronRight size={12} />
            <span className="text-stone-500">Settings</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg grid place-items-center text-blue-600 flex-shrink-0">
                <Settings size={20} />
              </div>
              <div>
                <h1 className="text-[1.375rem] font-bold tracking-tight text-stone-800">
                  Site Settings
                </h1>
                <p className="text-[0.8125rem] text-stone-500 mt-0.5">
                  Manage global configuration values
                </p>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white border-0 rounded-lg px-4 py-2 text-[0.8125rem] font-semibold cursor-pointer hover:bg-blue-700 transition-colors whitespace-nowrap"
              onClick={() => setShowModal(true)}
            >
              <Plus size={15} /> Add Setting
            </button>
          </div>

          {/* Card */}
          <div className="bg-white border border-stone-200 rounded-[10px] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-stone-400">
                {settings.length} {settings.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {settings.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-stone-400">
                No settings configured yet.
              </div>
            ) : (
              settings.map((s) => (
                <SettingRow key={s.key} setting={s} onSave={handleSave} />
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <AddSettingModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          existingKeys={settings.map((s) => s.key)}
        />
      )}
    </>
  );
}
