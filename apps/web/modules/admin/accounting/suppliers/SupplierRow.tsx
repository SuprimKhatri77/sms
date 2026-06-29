"use client";

import { Pencil, Trash2, Hash, Phone } from "lucide-react";
import { Supplier } from "@repo/types";
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";
import { accountingTdClass } from "../shared/accounting-styles";

interface SupplierRowProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SupplierRow({ supplier, onEdit, onDelete }: SupplierRowProps) {
  return (
    <tr className="transition-colors hover:bg-[rgba(47,78,64,0.02)]">
      <td className={`${accountingTdClass} font-medium`}>
        {supplier.companyName}
      </td>
      <td className={accountingTdClass}>
        {supplier.vatNo ? (
          <div className="flex items-center gap-1.5">
            <Hash size={11} className="shrink-0 text-[rgba(47,78,64,0.25)]" />
            <span className="font-mono text-[0.8125rem] tracking-wide text-[rgba(47,78,64,0.55)]">
              {supplier.vatNo}
            </span>
          </div>
        ) : (
          <span className="font-[family-name:var(--font-dm-sans)] text-[0.8125rem] italic text-[rgba(47,78,64,0.3)]">
            —
          </span>
        )}
      </td>
      <td className={accountingTdClass}>
        {supplier.phone ? (
          <div className="flex items-center gap-1.5">
            <Phone size={11} className="shrink-0 text-[rgba(47,78,64,0.25)]" />
            <span className="font-[family-name:var(--font-dm-sans)] text-[0.8125rem] text-[rgba(47,78,64,0.55)]">
              {supplier.phone}
            </span>
          </div>
        ) : (
          <span className="font-[family-name:var(--font-dm-sans)] text-[0.8125rem] italic text-[rgba(47,78,64,0.3)]">
            —
          </span>
        )}
      </td>
      <td className={`${accountingTdClass} text-[rgba(47,78,64,0.55)]`}>
        {formatDate(supplier.createdAt)}
      </td>
      <td className={`${accountingTdClass} text-right`}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(supplier)}
            aria-label={`Edit ${supplier.companyName}`}
            className={adminIconButtonClass}
          >
            <Pencil size={13} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(supplier)}
            aria-label={`Delete ${supplier.companyName}`}
            className={adminDangerIconButtonClass}
          >
            <Trash2 size={13} strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}
