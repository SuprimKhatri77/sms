"use client";

import * as React from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCT_UNITS } from "../lib/utils";

type UnitComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function UnitCombobox({ value, onChange, onBlur }: UnitComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = PRODUCT_UNITS.filter((u) =>
    u.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const isCustomValue =
    value && !PRODUCT_UNITS.includes(value as (typeof PRODUCT_UNITS)[number]);
  const displayLabel = value || "Select unit";

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setInputValue("");
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onBlur]);

  const handleOpen = () => {
    setOpen(true);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (unit: string) => {
    onChange(unit);
    setOpen(false);
    setInputValue("");
  };

  const handleAddCustom = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setOpen(false);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If there's exactly one match, select it; otherwise add custom
      if (filtered.length === 1) {
        handleSelect(filtered[0]);
      } else if (inputValue.trim()) {
        handleAddCustom();
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setInputValue("");
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={
          open
            ? () => {
                setOpen(false);
                setInputValue("");
              }
            : handleOpen
        }
        className={cn(
          "flex w-full items-center justify-between rounded-none border bg-white px-3 py-2 text-sm normal-case tracking-normal",
          "border-[rgba(47,78,64,0.18)] focus:outline-none focus:border-(--brand-green)",
          !value && "text-[rgba(47,78,64,0.45)]",
        )}
      >
        <span className={cn("truncate", isCustomValue && "italic")}>
          {displayLabel}
          {isCustomValue && (
            <span className="ml-1 text-xs text-[var(--brand-ink)]/50">
              (custom)
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 text-[var(--brand-ink)]/40 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full border border-[rgba(47,78,64,0.18)]",
            "bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
          )}
        >
          <div className="flex items-center gap-1 border-b border-[rgba(47,78,64,0.12)] px-2 py-1.5">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or type custom unit…"
              className="flex-1 bg-transparent py-0.5 text-sm text-(--brand-ink) outline-none placeholder:text-[rgba(47,78,64,0.35)]"
            />
          </div>

          {/* Unit list */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((u) => (
                <li key={u}>
                  <button
                    type="button"
                    onClick={() => handleSelect(u)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-(--brand-ink) transition-colors hover:bg-[rgba(47,78,64,0.04)]",
                      value === u && "font-medium",
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-[var(--brand-green)]",
                        value === u ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {u}
                  </button>
                </li>
              ))
            ) : (
              <li
                className="px-3 py-2 text-xs text-[var(--brand-ink)]/40"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                No matching units
              </li>
            )}
          </ul>

          {/* Add custom unit option — shown when input has text and doesn't exactly match */}
          {inputValue.trim() &&
            !PRODUCT_UNITS.map((u) => u.toLowerCase()).includes(
              inputValue.trim().toLowerCase(),
            ) && (
              <div className="border-t border-[var(--brand-ink)]/10 p-1">
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm",
                    "text-[var(--brand-green)] hover:bg-[var(--brand-green)]/10 transition-colors font-medium",
                  )}
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  Add &ldquo;{inputValue.trim()}&rdquo; as custom unit
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
