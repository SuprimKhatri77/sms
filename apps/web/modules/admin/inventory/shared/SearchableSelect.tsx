"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { inventoryFieldInputClass } from "./InventoryFormField";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

const DROPDOWN_ESTIMATED_HEIGHT = 200;

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") return el;
    el = el.parentElement;
  }
  return null;
}

type Props = {
  value: string;
  onChange: (value: string, label: string) => void;
  onSearch: (query: string) => Promise<SearchableSelectOption[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  initialOptions?: SearchableSelectOption[];
  /** Display label for the currently selected value (when value is set but not in options) */
  selectedLabel?: string;
  debounceMs?: number;
};

export function SearchableSelect({
  value,
  onChange,
  onSearch,
  placeholder = "Search…",
  className,
  disabled,
  initialOptions,
  selectedLabel,
  debounceMs = 350,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchableSelectOption[]>(
    initialOptions ?? [],
  );
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const searchVersionRef = useRef(0);

  const displayLabel =
    selectedLabel ??
    options.find((o) => o.value === value)?.label ??
    "";

  useEffect(() => {
    if (initialOptions) setOptions(initialOptions);
  }, [initialOptions]);

  const doSearch = useCallback(
    async (q: string) => {
      const version = ++searchVersionRef.current;
      setLoading(true);
      try {
        const results = await onSearch(q);
        if (version === searchVersionRef.current) {
          setOptions(results);
        }
      } finally {
        if (version === searchVersionRef.current) {
          setLoading(false);
        }
      }
    },
    [onSearch],
  );

  // Load initial options when dropdown opens
  useEffect(() => {
    if (open && options.length === 0 && !loading) {
      doSearch("");
    }
  }, [open]);

  // Flip the dropdown upward (and nudge it into view) when there isn't
  // enough room below within the nearest scrollable ancestor
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
    const shouldDropUp =
      spaceBelow < DROPDOWN_ESTIMATED_HEIGHT && spaceAbove > spaceBelow;
    setDropUp(shouldDropUp);

    const availableSpace = shouldDropUp ? spaceAbove : spaceBelow;
    if (availableSpace < DROPDOWN_ESTIMATED_HEIGHT) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(val);
    }, debounceMs);
  };

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.value, option.label);
    setQuery("");
    setOpen(false);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.stopPropagation();
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open]);

  const triggerClass = cn(
    inventoryFieldInputClass,
    "flex h-auto w-full cursor-pointer items-center justify-between py-2",
    className,
  );

  const showLoadingSkeleton = loading && options.length === 0;

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={handleTriggerClick}
          disabled={disabled}
          className={triggerClass}
        >
          <span
            className={cn(
              "truncate text-left",
              !value && "text-[rgba(47,78,64,0.45)]",
            )}
          >
            {value ? displayLabel : placeholder}
          </span>
          <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 text-[rgba(47,78,64,0.35)]" />
        </button>
      ) : (
        <div className="flex flex-col">
          <div className={cn(triggerClass, "gap-2")}>
            <Search className="h-3.5 w-3.5 shrink-0 text-[rgba(47,78,64,0.35)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[rgba(47,78,64,0.45)]"
            />
            <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[rgba(47,78,64,0.35)]" />
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "absolute left-0 z-50 max-h-46 w-full rounded-none border border-[rgba(47,78,64,0.18)] bg-white shadow-md",
              dropUp ? "bottom-full mb-1" : "top-full mt-1",
              showLoadingSkeleton ? "overflow-hidden" : "overflow-y-auto",
            )}
          >
            {showLoadingSkeleton ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`loading-row-${index}`}
                    className="flex items-center py-1.5"
                  >
                    <Skeleton className="h-4 w-[72%]" />
                  </div>
                ))}
              </div>
            ) : options.length === 0 && !loading ? (
              <div className="px-3 py-2 text-xs text-[rgba(47,78,64,0.45)]">
                No results found
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-[rgba(47,78,64,0.04)]",
                    option.value === value &&
                      "bg-[rgba(47,78,64,0.06)] font-medium",
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
