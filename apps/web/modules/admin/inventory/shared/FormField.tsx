import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormField({
  label,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label
        className="text-sm font-medium text-[var(--brand-ink)]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p
          className="text-xs text-red-500"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
