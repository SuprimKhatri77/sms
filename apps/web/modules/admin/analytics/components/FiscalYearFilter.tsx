"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  listFiscalYearOptions,
  type FiscalYearOption,
} from "../fiscal-year";

const triggerClass = cn(
  "h-9 min-w-[9.5rem] rounded-none border-[rgba(47,78,64,0.18)] bg-white px-3",
  "font-(family-name:--font-dm-sans) text-sm text-(--brand-green)",
  "shadow-none hover:bg-white focus-visible:border-(--brand-green) focus-visible:ring-(--brand-green)/20",
);

type FiscalYearFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options?: FiscalYearOption[];
  disabled?: boolean;
};

export function FiscalYearFilter({
  value,
  onChange,
  options = listFiscalYearOptions(),
  disabled = false,
}: FiscalYearFilterProps) {
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClass} size="default">
        <SelectValue placeholder="All time">
          {selected?.label ?? "All time"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        className="rounded-none border border-[rgba(47,78,64,0.18)] bg-white shadow-md ring-0"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="rounded-none"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
