import { cn } from "@/lib/utils";
import {
  admissionErrorClass,
  admissionLabelClass,
  admissionSegmentActiveClass,
  admissionSegmentBaseClass,
  admissionSegmentInactiveClass,
} from "./admission-styles";

export function TileGroup({
  label,
  options,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className={admissionLabelClass}>
        {label}
        {required ? (
          <span className="ml-1 text-(--brand-brown)">*</span>
        ) : null}
      </label>
      <div
        className="flex overflow-hidden ring-1 ring-[rgba(47,78,64,0.1)]"
        role="group"
        aria-label={label}
      >
        {options.map((o, idx) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              admissionSegmentBaseClass,
              idx > 0 && "border-l border-[rgba(47,78,64,0.08)]",
              value === o.value
                ? admissionSegmentActiveClass
                : admissionSegmentInactiveClass,
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error ? <p className={admissionErrorClass}>{error}</p> : null}
    </div>
  );
}
