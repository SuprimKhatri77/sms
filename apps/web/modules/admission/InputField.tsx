import { useId } from "react";
import { cn } from "@/lib/utils";
import {
  admissionErrorClass,
  admissionIconClass,
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
  id,
  ...props
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={admissionLabelClass}>
        {label}
        {required ? <span className="ml-1 text-clay-deep">*</span> : null}
      </label>
      <div className="relative">
        <span className={cn(admissionIconClass, "top-1/2 -translate-y-1/2")}>
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <input
          {...props}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            admissionInputClass,
            error ? admissionInputErrorBorder : admissionInputNormalBorder,
            className,
          )}
        />
      </div>
      {error ? (
        <p role="alert" className={admissionErrorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
