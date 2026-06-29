"use client";

import { BankAccountRow } from "./BankAccountRow";
import { BankAccount, PaginationMeta } from "@repo/types";
import { Pagination } from "../../inventory/shared/Pagination";
import {
  accountingTableClass,
  accountingTableScrollClass,
  accountingTableWrapClass,
  accountingThClass,
} from "../shared/accounting-styles";

interface BankAccountsTableProps {
  accounts: BankAccount[];
  meta: PaginationMeta;
  togglingId: string | null;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
  onToggleDefault: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function BankAccountsTable({
  accounts,
  meta,
  togglingId,
  onEdit,
  onDelete,
  onToggleDefault,
  onPageChange,
}: BankAccountsTableProps) {
  return (
    <div className={accountingTableWrapClass}>
      <div className={accountingTableScrollClass}>
        <table className={accountingTableClass}>
          <thead>
            <tr>
              <th className={accountingThClass}>Account</th>
              <th className={accountingThClass}>Account No.</th>
              <th className={accountingThClass}>Created</th>
              <th className={accountingThClass}>Default</th>
              <th className={`${accountingThClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <BankAccountRow
                key={account.id}
                account={account}
                togglingId={togglingId}
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
