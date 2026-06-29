"use client";

import { AmountCell } from "../shared/AmountCell";
import { EmptyState } from "../shared/EmptyState";
import { formatAmount } from "../lib/utils";
import { InventorySummaryResponse } from "@repo/types";
import {
  inventoryTableClass,
  inventoryTableScrollClass,
  inventoryTableWrapClass,
  inventoryTdClass,
  inventoryThClass,
} from "../shared/inventory-styles";

type InventorySummaryRow = Extract<
  InventorySummaryResponse,
  { success: true }
>["data"][number];
type Props = { data: InventorySummaryRow[] };

export function SummaryTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className={inventoryTableWrapClass}>
        <EmptyState message="No summary data available for the selected period." />
      </div>
    );
  }

  const totals = data.reduce(
    (acc, row) => ({
      stock_in_amount: acc.stock_in_amount + row.stockInAmount,
      stock_out_amount: acc.stock_out_amount + row.stockOutAmount,
      wastage_amount: acc.wastage_amount + row.wastageAmount,
      closing_amount: acc.closing_amount + row.closingAmount,
    }),
    {
      stock_in_amount: 0,
      stock_out_amount: 0,
      wastage_amount: 0,
      closing_amount: 0,
    },
  );

  const headers = [
    "Product",
    "Unit",
    "Stock In (qty)",
    "Stock Out (qty)",
    "Wastage (qty)",
    "Closing (qty)",
    "Stock In Amt",
    "Stock Out Amt",
    "Wastage Amt",
    "Closing Amt",
  ];

  return (
    <div className={inventoryTableWrapClass}>
      <div className={inventoryTableScrollClass}>
        <table className={inventoryTableClass}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} className={inventoryThClass}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.productId}
                className="transition-colors hover:bg-[rgba(47,78,64,0.02)]"
              >
                <td className={`${inventoryTdClass} font-medium`}>
                  {row.productName}
                </td>
                <td className={`${inventoryTdClass} text-xs text-[rgba(47,78,64,0.55)]`}>
                  {row.productUnit}
                </td>
                <td className={inventoryTdClass}>{row.stockInQty}</td>
                <td className={inventoryTdClass}>{row.stockOutQty}</td>
                <td className={inventoryTdClass}>{row.wastageQty}</td>
                <td className={`${inventoryTdClass} font-semibold text-(--brand-green)`}>
                  {row.closingQty}
                </td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.stockInAmount} />
                </td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.stockOutAmount} />
                </td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.wastageAmount} />
                </td>
                <td className={`${inventoryTdClass} font-semibold`}>
                  <AmountCell cents={row.closingAmount} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[rgba(47,78,64,0.04)]">
              <td
                colSpan={6}
                className="px-5 py-4 font-[family-name:var(--font-dm-sans)] text-xs font-bold uppercase tracking-[0.08em] text-(--brand-green)"
              >
                Totals
              </td>
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.stock_in_amount)}
              </td>
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.stock_out_amount)}
              </td>
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.wastage_amount)}
              </td>
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.closing_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
