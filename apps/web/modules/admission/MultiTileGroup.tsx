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
  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt],
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <label className={admissionLabelClass}>
        {label}
        {required ? (
          <span className="ml-1 text-(--brand-brown)">*</span>
        ) : null}
        <span
          className={`${admissionHintClass} ml-2 normal-case tracking-normal`}
        >
          — tap all that apply
        </span>
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const selected = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={cn(
                admissionCourseCardBaseClass,
                selected
                  ? admissionCourseCardActiveClass
                  : admissionCourseCardInactiveClass,
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
                  selected
                    ? "border-(--brand-brown) bg-(--brand-brown) text-white"
                    : "border-[rgba(47,78,64,0.2)] bg-white text-transparent group-hover:border-[rgba(194,138,79,0.45)]",
                )}
              >
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-[family-name:var(--font-dm-sans)] text-[0.92rem] font-semibold capitalize text-(--brand-green)">
                  {o.label}
                </span>
                <span className="mt-0.5 block font-[family-name:var(--font-dm-sans)] text-[0.76rem] text-[rgba(47,78,64,0.45)]">
                  {selected ? "Selected" : "Tap to select"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {error ? <p className={admissionErrorClass}>{error}</p> : null}
    </div>
  );
}
