import type { ReactNode } from "react";
import { adminInputClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { inventoryLabelClass } from "./inventory-styles";

export const inventoryFieldInputClass = cn(
  adminInputClass,
  "rounded-none normal-case tracking-normal shadow-none",
);

export const inventorySelectTriggerClass = cn(
  inventoryFieldInputClass,
  "flex h-auto w-full items-center justify-between py-2",
);

type InventoryFormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: ReactNode;
};

export function InventoryFormField({
  label,
  htmlFor,
  required,
  optional,
  error,
  children,
}: InventoryFormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className={inventoryLabelClass}>
        <span className="inline-flex flex-wrap items-baseline gap-x-1">
          <span>{label}</span>
          {required ? <span className="text-[#9a3412]">*</span> : null}
          {optional ? (
            <span className="font-normal normal-case tracking-normal text-[rgba(47,78,64,0.45)]">
              (optional)
            </span>
          ) : null}
        </span>
      </label>
      {children}
      {error ? (
        <span className="text-xs font-normal normal-case tracking-normal text-[#9a3412]">
          {error}
        </span>
      ) : null}
    </div>
  );
}

type InventoryFormSectionProps = {
  title: string;
  children: ReactNode;
};

export function InventoryFormSection({
  title,
  children,
}: InventoryFormSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="border-b border-[rgba(47,78,64,0.1)] pb-2 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.4)]">
        {title}
      </h3>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
