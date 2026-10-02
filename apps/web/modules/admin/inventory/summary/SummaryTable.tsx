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
import { CategoryCell } from "../shared/CategoryCell";

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
      opening_amount: acc.opening_amount + row.openingAmount,
      stock_in_amount: acc.stock_in_amount + row.stockInAmount,
      stock_out_amount: acc.stock_out_amount + row.stockOutAmount,
      stock_out_cost: acc.stock_out_cost + row.stockOutCost,
      wastage_cost: acc.wastage_cost + row.wastageCost,
      closing_amount: acc.closing_amount + row.closingAmount,
    }),
    {
      opening_amount: 0,
      stock_in_amount: 0,
      stock_out_amount: 0,
      stock_out_cost: 0,
      wastage_cost: 0,
      closing_amount: 0,
    },
  );
  const grossProfit = totals.stock_out_amount - totals.stock_out_cost;

  // Opening, closing and costs are at purchase price (FIFO batches); sales
  // amount is what the units sold for.
  const headers = [
    "Product",
    "Category",
    "Unit",
    "Opening (Qty)",
    "Opening (Value)",
    "Purchase (Qty)",
    "Purchase (Amt)",
    "Sales (Qty)",
    "Sales (Amt)",
    "Sales (Cost)",
    "Wastage (Qty)",
    "Wastage (Cost)",
    "Closing (Qty)",
    "Closing (Value)",
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
                <CategoryCell path={row.categoryPath} />
                <td className={`${inventoryTdClass} text-xs text-[rgba(47,78,64,0.55)]`}>
                  {row.productUnit}
                </td>
                <td className={inventoryTdClass}>{row.openingQty}</td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.openingAmount} />
                </td>
                <td className={inventoryTdClass}>{row.stockInQty}</td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.stockInAmount} />
                </td>
                <td className={inventoryTdClass}>{row.stockOutQty}</td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.stockOutAmount} />
                </td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.stockOutCost} />
                </td>
                <td className={inventoryTdClass}>{row.wastageQty}</td>
                <td className={inventoryTdClass}>
                  <AmountCell cents={row.wastageCost} />
                </td>
                <td className={`${inventoryTdClass} font-semibold text-(--brand-green)`}>
                  {row.closingQty}
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
                colSpan={3}
                className="px-5 py-4 font-(family-name:--font-dm-sans) text-xs font-bold uppercase tracking-[0.08em] text-(--brand-green)"
              >
                Totals
              </td>
              <td className={inventoryTdClass} />
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.opening_amount)}
              </td>
              <td className={inventoryTdClass} />
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.stock_in_amount)}
              </td>
              <td className={inventoryTdClass} />
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.stock_out_amount)}
              </td>
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.stock_out_cost)}
              </td>
              <td className={inventoryTdClass} />
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.wastage_cost)}
              </td>
              <td className={inventoryTdClass} />
              <td className={`${inventoryTdClass} font-bold text-(--brand-green)`}>
                {formatAmount(totals.closing_amount)}
              </td>
            </tr>
            <tr className="bg-[rgba(47,78,64,0.04)]">
              <td
                colSpan={headers.length}
                className="px-5 pb-4 font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.7)]"
              >
                <span className="font-bold uppercase tracking-[0.08em] text-(--brand-green)">
                  Gross profit
                </span>{" "}
                <span
                  className={`tabular-nums font-semibold ${grossProfit < 0 ? "text-[#9a3412]" : "text-(--brand-green)"}`}
                >
                  {formatAmount(grossProfit)}
                </span>{" "}
                (sales minus what the sold units cost)
                <span className="mx-3 text-[rgba(47,78,64,0.3)]">·</span>
                <span className="font-bold uppercase tracking-[0.08em] text-(--brand-green)">
                  Wastage loss
                </span>{" "}
                <span className="tabular-nums font-semibold text-(--brand-green)">
                  {formatAmount(totals.wastage_cost)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
