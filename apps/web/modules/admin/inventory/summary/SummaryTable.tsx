"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { AmountCell } from "../shared/AmountCell";
import { EmptyState } from "../shared/EmptyState";
import type { InventorySummaryRow } from "../types";
import { formatAmount } from "../lib/utils";

type Props = { data: InventorySummaryRow[] };

export function SummaryTable({ data }: Props) {
  if (data.length === 0)
    return (
      <EmptyState message="No summary data available for the selected period." />
    );

  // Totals row — sum all amount columns
  const totals = data.reduce(
    (acc, row) => ({
      stock_in_amount: acc.stock_in_amount + row.stock_in_amount,
      stock_out_amount: acc.stock_out_amount + row.stock_out_amount,
      wastage_amount: acc.wastage_amount + row.wastage_amount,
      closing_amount: acc.closing_amount + row.closing_amount,
    }),
    {
      stock_in_amount: 0,
      stock_out_amount: 0,
      wastage_amount: 0,
      closing_amount: 0,
    },
  );

  return (
    <div className="rounded-lg border border-[var(--brand-green)]/15 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--brand-green)]/5 hover:bg-[var(--brand-green)]/5">
            {[
              "Product",
              "Unit",
              "Stock In (qty)",
              "Stock Out (qty)",
              "Wastage (qty)",
              "Closing Stock (qty)",
              "Stock In Amt",
              "Stock Out Amt",
              "Wastage Amt",
              "Closing Amt",
            ].map((h) => (
              <TableHead
                key={h}
                className="font-[var(--font-dm-sans)] font-semibold text-[var(--brand-green)] text-xs uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.product_id}
              className="border-[var(--brand-green)]/10 hover:bg-[var(--brand-green)]/3 font-[var(--font-dm-sans)]"
            >
              <TableCell className="font-medium text-[var(--brand-ink)]">
                {row.product_name}
              </TableCell>
              <TableCell className="text-[var(--brand-ink)]/60 text-xs">
                {row.product_unit}
              </TableCell>
              <TableCell className="text-[var(--brand-ink)]">
                {row.stock_in_qty}
              </TableCell>
              <TableCell className="text-[var(--brand-ink)]">
                {row.stock_out_qty}
              </TableCell>
              <TableCell className="text-[var(--brand-ink)]">
                {row.wastage_qty}
              </TableCell>
              <TableCell className="font-semibold text-[var(--brand-green)]">
                {row.closing_qty}
              </TableCell>
              <TableCell>
                <AmountCell cents={row.stock_in_amount} />
              </TableCell>
              <TableCell>
                <AmountCell cents={row.stock_out_amount} />
              </TableCell>
              <TableCell>
                <AmountCell cents={row.wastage_amount} />
              </TableCell>
              <TableCell className="font-semibold">
                <AmountCell cents={row.closing_amount} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-[var(--brand-green)]/10 font-[var(--font-dm-sans)] font-bold">
            <TableCell
              colSpan={6}
              className="text-[var(--brand-green)] text-sm font-bold"
            >
              Totals
            </TableCell>
            <TableCell className="text-[var(--brand-green)]">
              {formatAmount(totals.stock_in_amount)}
            </TableCell>
            <TableCell className="text-[var(--brand-green)]">
              {formatAmount(totals.stock_out_amount)}
            </TableCell>
            <TableCell className="text-[var(--brand-green)]">
              {formatAmount(totals.wastage_amount)}
            </TableCell>
            <TableCell className="text-[var(--brand-green)]">
              {formatAmount(totals.closing_amount)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
