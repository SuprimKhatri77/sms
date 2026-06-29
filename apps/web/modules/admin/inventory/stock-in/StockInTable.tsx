"use client";

import { Pencil, Trash2 } from "lucide-react";
import { AmountCell } from "../shared/AmountCell";
import { EmptyState } from "../shared/EmptyState";
import { Pagination } from "../shared/Pagination";
import { ListStockInResponse } from "@repo/types";
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";
import {
  inventoryTableClass,
  inventoryTableScrollClass,
  inventoryTableWrapClass,
  inventoryTdClass,
  inventoryThClass,
} from "../shared/inventory-styles";

type StockIn = Extract<ListStockInResponse, { success: true }>["data"][number];
type Props = {
  data: StockIn[];
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (item: StockIn) => void;
  onDelete: (item: StockIn) => void;
};

const headers = [
  "Product",
  "Date (BS)",
  "Invoice No",
  "Qty",
  "Rate",
  "Amount",
  "Note",
  "Actions",
];

export function StockInTable({
  data,
  currentPage,
  limit,
  total,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: Props) {
  if (data.length === 0) {
    return (
      <div className={inventoryTableWrapClass}>
        <EmptyState message="No stock-in records yet. Add your first entry above." />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className={inventoryTableWrapClass}>
        <div className={inventoryTableScrollClass}>
          <table className={inventoryTableClass}>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className={`${inventoryThClass} ${h === "Actions" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-[rgba(47,78,64,0.02)]"
                >
                  <td className={`${inventoryTdClass} font-medium`}>
                    {row.productName}
                  </td>
                  <td className={`${inventoryTdClass} text-[rgba(47,78,64,0.6)]`}>
                    {row.date}
                  </td>
                  <td className={`${inventoryTdClass} text-[rgba(47,78,64,0.55)]`}>
                    {row.invoiceNo ?? "—"}
                  </td>
                  <td className={inventoryTdClass}>
                    {row.qty}{" "}
                    <span className="text-xs text-[rgba(47,78,64,0.45)]">
                      {row.productUnit}
                    </span>
                  </td>
                  <td className={inventoryTdClass}>
                    <AmountCell cents={row.rate} />
                  </td>
                  <td className={inventoryTdClass}>
                    <AmountCell cents={row.qty * row.rate} />
                  </td>
                  <td className={`${inventoryTdClass} max-w-[140px] truncate text-[rgba(47,78,64,0.55)]`}>
                    {row.note ?? "—"}
                  </td>
                  <td className={`${inventoryTdClass} text-right`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className={adminIconButtonClass}
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className={adminDangerIconButtonClass}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={currentPage}
          meta={{ total, totalPages, limit }}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
