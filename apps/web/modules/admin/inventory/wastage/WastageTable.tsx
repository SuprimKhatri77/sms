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
import type { Wastage } from "../types";

type Props = {
  data: Wastage[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (item: Wastage) => void;
  onDelete: (item: Wastage) => void;
};

export function WastageTable({
  data,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: Props) {
  if (data.length === 0)
    return (
      <EmptyState message="No wastage recorded. Hopefully it stays that way." />
    );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--brand-green)]/15 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--brand-green)]/5 hover:bg-[var(--brand-green)]/5">
              {[
                "Product",
                "Date (BS)",
                "Qty",
                "Rate",
                "Amount",
                "Reason",
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
                  {row.product_name}
                </TableCell>
                <TableCell className="text-[var(--brand-ink)]/70">
                  {row.date}
                </TableCell>
                <TableCell>
                  {row.qty}{" "}
                  <span className="text-xs text-[var(--brand-ink)]/50">
                    {row.product_unit}
                  </span>
                </TableCell>
                <TableCell>
                  <AmountCell cents={row.rate} />
                </TableCell>
                <TableCell>
                  <AmountCell cents={row.qty * row.rate} />
                </TableCell>
                <TableCell className="text-[var(--brand-ink)]/60 max-w-[140px] truncate">
                  {row.reason ?? "—"}
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
        meta={{ totalPages: totalPages, total: data.length, limit: 20 }}
        page={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}
