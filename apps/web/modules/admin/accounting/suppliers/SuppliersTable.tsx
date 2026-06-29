"use client";

import { PaginationMeta, Supplier } from "@repo/types";
import { SupplierRow } from "./SupplierRow";
import { Pagination } from "../../inventory/shared/Pagination";
import {
  accountingTableClass,
  accountingTableScrollClass,
  accountingTableWrapClass,
  accountingThClass,
} from "../shared/accounting-styles";

interface SuppliersTableProps {
  suppliers: Supplier[];
  meta: PaginationMeta;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onPageChange: (page: number) => void;
}

export function SuppliersTable({
  suppliers,
  meta,
  onEdit,
  onDelete,
  onPageChange,
}: SuppliersTableProps) {
  return (
    <div className={accountingTableWrapClass}>
      <div className={accountingTableScrollClass}>
        <table className={accountingTableClass}>
          <thead>
            <tr>
              <th className={accountingThClass}>Company Name</th>
              <th className={accountingThClass}>VAT No.</th>
              <th className={accountingThClass}>Phone</th>
              <th className={accountingThClass}>Created</th>
              <th className={`${accountingThClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <SupplierRow
                key={supplier.id}
                supplier={supplier}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={meta.page} meta={meta} onPageChange={onPageChange} />
    </div>
  );
}
