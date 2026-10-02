"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { inventoryFieldInputClass } from "./InventoryFormField";
import { DROPDOWN_ESTIMATED_HEIGHT, getScrollParent } from "./SearchableSelect";

export type StaticSelectOption<T extends string = string> = {
  value: T;
  label: string;
  /** a second, quieter line under the label */
  hint?: string;
};

type Props<T extends string> = {
  value: T | "";
  onChange: (value: T) => void;
  options: StaticSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * A dropdown for a short, fixed list of options: it looks and opens like
 * SearchableSelect (the list right under the field), without the search box.
 * Keyboard: arrows move, Enter/Space picks, Esc or Tab closes.
 */
export function StaticSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  "aria-label": ariaLabel,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const openList = () => {
    if (disabled) return;
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };

  const close = () => setOpen(false);

  const pick = (option: StaticSelectOption<T>) => {
    onChange(option.value);
    close();
    triggerRef.current?.focus();
  };

  // flip upward when there isn't room below, like SearchableSelect
  useEffect(() => {
    if (!open || !containerRef.current) return;
    const el = containerRef.current;
    const scrollParent = getScrollParent(el);
    const viewport = scrollParent
      ? scrollParent.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };
    const rect = el.getBoundingClientRect();
    const spaceBelow = viewport.bottom - rect.bottom;
    const spaceAbove = rect.top - viewport.top;
    setDropUp(
      spaceBelow < DROPDOWN_ESTIMATED_HEIGHT && spaceAbove > spaceBelow,
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Esc closes just the list: caught on the way down (capture), so the
  // dialog or page shortcut around it doesn't also close, as in
  // SearchableSelect
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + options.length) % options.length);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const option = options[active];
        if (option) pick(option);
        break;
      }
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleKeyDown}
        className={cn(
          inventoryFieldInputClass,
          "flex h-auto w-full cursor-pointer items-center justify-between py-2 text-left disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <span
          className={cn("truncate", !selected && "text-[rgba(47,78,64,0.45)]")}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-3.5 w-3.5 shrink-0 text-[rgba(47,78,64,0.35)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute left-0 z-50 max-h-60 w-full overflow-y-auto rounded-none border border-[rgba(47,78,64,0.18)] bg-white py-1 shadow-md",
            dropUp ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(option)}
                className={cn(
                  "flex cursor-pointer items-start justify-between gap-3 px-3 py-1.5 text-sm transition-colors",
                  i === active && "bg-[rgba(47,78,64,0.04)]",
                  isSelected && "bg-[rgba(47,78,64,0.06)] font-medium",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.hint && (
                    <span className="block text-xs font-normal text-[rgba(47,78,64,0.5)]">
                      {option.hint}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--brand-green)" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
