"use client";

import { useState } from "react";
import { Status } from "./StudentDetail";
import { CheckCircle2 } from "lucide-react";

const STATUS_META: Record<
  Status,
  { label: string; classes: string; dotClass: string; ringClass: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-400",
    ringClass: "ring-amber-300",
  },
  active: {
    label: "Active",
    classes: "bg-green-50 text-green-700 border-green-200",
    dotClass: "bg-green-400",
    ringClass: "ring-green-300",
  },
  completed: {
    label: "Completed",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-400",
    ringClass: "ring-blue-300",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-50 text-red-700 border-red-200",
    dotClass: "bg-red-400",
    ringClass: "ring-red-300",
  },
};

const ALL_STATUSES = Object.keys(STATUS_META) as Status[];

export function StatusEditor({
  current,
  onUpdate,
}: {
  current: Status;
  onUpdate: (next: Status) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<Status>(current);
  const [loading, setLoading] = useState(false);
  const isDirty = selected !== current;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onUpdate(selected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Pill radio buttons */}
      {ALL_STATUSES.map((s) => {
        const meta = STATUS_META[s];
        const isSelected = selected === s;
        const isCurrent = s === current;
        return (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`
              inline-flex items-center gap-1.5 rounded-full border px-3 py-1
              text-[0.75rem] font-semibold transition-all
              ${meta.classes}
              ${isSelected ? `ring-2 ${meta.ringClass} ring-offset-1 ring-offset-[#f4f1ec]` : "opacity-50 hover:opacity-80"}
            `}
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {/* Checkbox indicator */}
            <span
              className={`
                flex h-3.5 w-3.5 items-center justify-center rounded-full border
                ${isSelected ? `${meta.dotClass} border-transparent` : "border-current bg-transparent"}
              `}
            >
              {isSelected && (
                <svg viewBox="0 0 10 10" className="h-2 w-2 fill-white">
                  <path
                    d="M1.5 5 L4 7.5 L8.5 2.5"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {isCurrent && !isDirty && (
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
            )}
            {meta.label}
          </button>
        );
      })}

      {/* Update button — slides in when dirty */}
      <div
        className={`
          overflow-hidden transition-all duration-200
          ${isDirty ? "max-w-35 opacity-100" : "max-w-0 opacity-0"}
        `}
      >
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-[#2d4a3e] px-3 py-1.5
                     text-[0.78rem] font-semibold text-white whitespace-nowrap
                     transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(45,74,62,0.25)]
                     disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {loading ? (
            <svg
              className="h-3 w-3 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : (
            <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
          )}
          Update Status
        </button>
      </div>
    </div>
  );
}
