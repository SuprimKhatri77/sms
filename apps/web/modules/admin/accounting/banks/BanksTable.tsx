"use client";

import { Bank } from "@repo/types";
import { Pagination } from "../../inventory/shared/Pagination";
import { BankRow } from "./BanksRow";
import {
  accountingTableClass,
  accountingTableScrollClass,
  accountingTableWrapClass,
  accountingThClass,
} from "../shared/accounting-styles";

interface BanksTableProps {
  banks: Bank[];
  meta: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  toggleLoadingId: string | null;
  onEdit: (bank: Bank) => void;
  onDelete: (bank: Bank) => void;
  onToggleDefault: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function BanksTable({
  banks,
  meta,
  toggleLoadingId,
  onEdit,
  onDelete,
  onToggleDefault,
  onPageChange,
}: BanksTableProps) {
  return (
    <div className={accountingTableWrapClass}>
      <div className={accountingTableScrollClass}>
        <table className={accountingTableClass}>
          <thead>
            <tr>
              <th className={accountingThClass}>Bank Name</th>
              <th className={accountingThClass}>Default</th>
              <th className={accountingThClass}>Created</th>
              <th className={`${accountingThClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <BankRow
                key={bank.id}
                bank={bank}
                toggleLoadingId={toggleLoadingId}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleDefault={onToggleDefault}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={meta.page} meta={meta} onPageChange={onPageChange} />
    </div>
  );
}
