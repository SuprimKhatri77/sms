"use client";

import { Pencil, Trash2, Hash } from "lucide-react";
import { BankAccountDefaultToggle } from "./BankAccountDefaultToggle";
import { BankAccount } from "@repo/types";
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";
import { accountingTdClass } from "../shared/accounting-styles";
import { cn } from "@/lib/utils";

interface BankAccountRowProps {
  account: BankAccount;
  togglingId: string | null;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
  onToggleDefault: (id: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BankAccountRow({
  account,
  togglingId,
  onEdit,
  onDelete,
  onToggleDefault,
}: BankAccountRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[rgba(47,78,64,0.02)]",
        account.isDefault && "bg-[rgba(47,78,64,0.03)]",
      )}
    >
      <td className={`${accountingTdClass} font-medium`}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span>{account.accountName}</span>
            {account.isDefault ? (
              <span className="shrink-0 border border-[rgba(47,78,64,0.2)] bg-[rgba(47,78,64,0.06)] px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-(--brand-green)">
                Default
              </span>
            ) : null}
          </div>
          <span className="font-[family-name:var(--font-dm-sans)] text-[0.78rem] text-[rgba(47,78,64,0.45)]">
            {account.bankName}
          </span>
        </div>
      </td>
      <td className={accountingTdClass}>
        {account.accountNumber ? (
          <div className="flex items-center gap-1.5">
            <Hash size={11} className="shrink-0 text-[rgba(47,78,64,0.25)]" />
            <span className="font-mono text-[0.8125rem] tracking-wide text-[rgba(47,78,64,0.55)]">
              {account.accountNumber}
            </span>
          </div>
        ) : (
          <span className="font-[family-name:var(--font-dm-sans)] text-[0.8125rem] italic text-[rgba(47,78,64,0.3)]">
            —
          </span>
        )}
      </td>
      <td className={`${accountingTdClass} text-[rgba(47,78,64,0.55)]`}>
        {formatDate(account.createdAt)}
      </td>
      <td className={accountingTdClass}>
        <BankAccountDefaultToggle
          isToggling={togglingId === account.id}
          accountId={account.id}
          isDefault={account.isDefault}
          onToggle={onToggleDefault}
        />
      </td>
      <td className={`${accountingTdClass} text-right`}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(account)}
            aria-label={`Edit ${account.accountName}`}
            className={adminIconButtonClass}
          >
            <Pencil size={13} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(account)}
            aria-label={`Delete ${account.accountName}`}
            className={adminDangerIconButtonClass}
          >
            <Trash2 size={13} strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}
