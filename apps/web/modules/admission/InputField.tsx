import { cn } from "@/lib/utils";
import {
  admissionErrorClass,
  admissionInputClass,
  admissionInputErrorBorder,
  admissionInputNormalBorder,
  admissionLabelClass,
} from "./admission-styles";

export function InputField({
  label,
  icon: Icon,
  error,
  required,
  className,
  ...props
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={admissionLabelClass}>
        {label}
        {required ? (
          <span className="ml-1 text-(--brand-brown)">*</span>
        ) : null}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(47,78,64,0.38)]">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <input
          {...props}
          className={cn(
            admissionInputClass,
            error ? admissionInputErrorBorder : admissionInputNormalBorder,
            className,
          )}
        />
      </div>
      {error ? <p className={admissionErrorClass}>{error}</p> : null}
    </div>
  );
}
