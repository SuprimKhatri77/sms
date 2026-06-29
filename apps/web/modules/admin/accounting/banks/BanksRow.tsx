"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Bank } from "@repo/types";
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";
import { accountingTdClass } from "../shared/accounting-styles";
import { BankDefaultToggle } from "./BankDefaultToggle";
import { cn } from "@/lib/utils";

interface BankRowProps {
  bank: Bank;
  toggleLoadingId: string | null;
  onEdit: (bank: Bank) => void;
  onDelete: (bank: Bank) => void;
  onToggleDefault: (id: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BankRow({
  bank,
  toggleLoadingId,
  onEdit,
  onDelete,
  onToggleDefault,
}: BankRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[rgba(47,78,64,0.02)]",
        bank.isDefault && "bg-[rgba(47,78,64,0.03)]",
      )}
    >
      <td className={`${accountingTdClass} font-medium`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span>{bank.name}</span>
          {bank.isDefault ? (
            <span className="shrink-0 border border-[rgba(47,78,64,0.2)] bg-[rgba(47,78,64,0.06)] px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-(--brand-green)">
              Default
            </span>
          ) : null}
        </div>
      </td>
      <td className={accountingTdClass}>
        <BankDefaultToggle
          bankId={bank.id}
          isDefault={bank.isDefault}
          loading={toggleLoadingId === bank.id}
          onToggle={onToggleDefault}
        />
      </td>
      <td className={`${accountingTdClass} text-[rgba(47,78,64,0.55)]`}>
        {formatDate(bank.createdAt)}
      </td>
      <td className={`${accountingTdClass} text-right`}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(bank)}
            aria-label={`Edit ${bank.name}`}
            className={adminIconButtonClass}
          >
            <Pencil size={13} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(bank)}
            aria-label={`Delete ${bank.name}`}
            className={adminDangerIconButtonClass}
          >
            <Trash2 size={13} strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}
