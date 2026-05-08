"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AmountCell } from "../shared/AmountCell";
import { EmptyState } from "../shared/EmptyState";
import { Pagination } from "../shared/Pagination";
import { ListStockInResponse } from "@repo/types";

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
      <EmptyState message="No stock-in records yet. Add your first entry above." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--brand-green)]/15 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--brand-green)]/5 hover:bg-[var(--brand-green)]/5">
              {[
                "Product",
                "Date (BS)",
                "Invoice No",
                "Qty",
                "Rate",
                "Amount",
                "Note",
                "Actions",
              ].map((h) => (
                <TableHead
                  key={h}
                  className="font-[var(--font-dm-sans)] font-semibold text-[var(--brand-green)] text-xs uppercase tracking-wide"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                className="border-[var(--brand-green)]/10 hover:bg-[var(--brand-green)]/3 font-[var(--font-dm-sans)]"
              >
                <TableCell className="font-medium text-[var(--brand-ink)]">
                  {row.productName}
                </TableCell>
                <TableCell className="text-[var(--brand-ink)]/70">
                  {row.date}
                </TableCell>
                <TableCell className="text-[var(--brand-ink)]/60">
                  {row.invoiceNo ?? "—"}
                </TableCell>
                <TableCell className="text-[var(--brand-ink)]">
                  {row.qty}{" "}
                  <span className="text-xs text-[var(--brand-ink)]/50">
                    {row.productUnit}
                  </span>
                </TableCell>
                <TableCell>
                  <AmountCell cents={row.rate} />
                </TableCell>
                <TableCell>
                  <AmountCell cents={row.qty * row.rate} />
                </TableCell>
                <TableCell className="text-[var(--brand-ink)]/60 max-w-[120px] truncate">
                  {row.note ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-[var(--brand-green)] hover:bg-[var(--brand-green)]/10"
                      onClick={() => onEdit(row)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-400 hover:bg-red-50"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        page={currentPage}
        meta={{ total, totalPages, limit }}
        onPageChange={onPageChange}
      />
    </div>
  );
}
