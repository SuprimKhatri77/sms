"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChoiceCardOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  icon?: LucideIcon;
};

type Props<T extends string> = {
  /** groups the radios; unique per form */
  name: string;
  label: string;
  value: T | "";
  onChange: (value: T) => void;
  options: ChoiceCardOption<T>[];
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
};

/**
 * A small set of choices shown as pressable cards. Each card is a real radio
 * input (visually hidden), so arrow keys move between them like any radio
 * group.
 */
export function ChoiceCards<T extends string>({
  name,
  label,
  value,
  onChange,
  options,
  disabled,
  invalid,
  className,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid gap-3",
        options.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      {options.map((option) => {
        const checked = value === option.value;
        const Icon = option.icon;
        return (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 border px-4 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--brand-green)/30",
              checked
                ? "border-(--brand-green) bg-[rgba(47,78,64,0.05)]"
                : "border-[rgba(47,78,64,0.18)] bg-white",
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-(--brand-green)",
              invalid && !checked && "border-[#9a3412]",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                checked
                  ? "border-(--brand-green)"
                  : "border-[rgba(47,78,64,0.35)]",
              )}
            >
              {checked && (
                <span className="h-2 w-2 rounded-full bg-(--brand-green)" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-ink)">
                {Icon && (
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 text-[rgba(47,78,64,0.55)]"
                    strokeWidth={1.75}
                  />
                )}
                {option.label}
              </span>
              {option.hint && (
                <span className="mt-0.5 block font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                  {option.hint}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
