import { useId } from "react";
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
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2.5">
      <span id={labelId} className={admissionLabelClass}>
        {label}
        {required ? <span className="ml-1 text-clay-deep">*</span> : null}
      </span>
      <div
        className={cn(
          // gap-px over a hairline background draws the dividers, even when
          // the options wrap; growing tiles leave no empty cells.
          "flex flex-wrap gap-px border bg-hairline",
          error ? "border-red-600" : "border-hairline",
        )}
        role="group"
        aria-labelledby={labelId}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              admissionSegmentBaseClass,
              value === o.value
                ? admissionSegmentActiveClass
                : admissionSegmentInactiveClass,
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className={admissionErrorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
