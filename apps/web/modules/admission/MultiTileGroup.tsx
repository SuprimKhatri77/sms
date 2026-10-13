import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  admissionCourseCardActiveClass,
  admissionCourseCardBaseClass,
  admissionCourseCardInactiveClass,
  admissionErrorClass,
  admissionHintClass,
  admissionLabelClass,
} from "./admission-styles";

export function MultiTileGroup({
  label,
  options,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
  required?: boolean;
}) {
  const labelId = useId();
  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt],
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <p id={labelId} className={admissionLabelClass}>
        {label}
        {required ? <span className="ml-1 text-clay-deep">*</span> : null}
        <span
          className={`${admissionHintClass} ml-2 tracking-normal normal-case`}
        >
          Tap all that apply
        </span>
      </p>
      <div
        role="group"
        aria-labelledby={labelId}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {options.map((o, idx) => {
          const selected = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(o.value)}
              className={cn(
                admissionCourseCardBaseClass,
                selected
                  ? admissionCourseCardActiveClass
                  : error
                    ? "border-red-600 bg-paper"
                    : admissionCourseCardInactiveClass,
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-label text-[0.625rem] tracking-[0.16em] text-ink-muted tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="mt-1.5 block font-display text-[1.375rem] leading-tight text-ink capitalize">
                  {o.label}
                </span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-300",
                  selected
                    ? "border-pine bg-pine text-paper"
                    : "border-ink/25 bg-paper text-transparent group-hover:border-ink/50",
                )}
              >
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className={admissionErrorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
