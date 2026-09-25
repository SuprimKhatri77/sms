"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "./SearchableSelect";
import { inventoryFieldInputClass } from "./InventoryFormField";
import { inventoryThClass } from "./inventory-styles";
import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

export type LineItemRow = {
  key: string;
  productID: string;
  productName: string;
  quantity: string;
  rate: string;
};

export function emptyLineItem(): LineItemRow {
  return {
    key: crypto.randomUUID(),
    productID: "",
    productName: "",
    quantity: "1",
    rate: "",
  };
}

export type LineItemErrors = Record<
  string,
  { productID?: string; quantity?: string; rate?: string }
>;

type Props = {
  items: LineItemRow[];
  onChange: (items: LineItemRow[]) => void;
  onSearchProducts: (query: string) => Promise<SearchableSelectOption[]>;
  errors?: LineItemErrors;
};

const cellClass = "px-2 py-2 align-top";
// the header row is hidden on phones, so each qty/rate cell shows its own label
const mobileLabelClass =
  "mb-1 block font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-widest text-[rgba(47,78,64,0.45)] sm:hidden";

export function LineItemsEditor({
  items,
  onChange,
  onSearchProducts,
  errors,
}: Props) {
  const updateItem = (key: string, patch: Partial<LineItemRow>) => {
    onChange(
      items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => onChange([...items, emptyLineItem()]);

  const removeItem = (key: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.key !== key));
  };

  // round each line to whole paisa before summing, the same way the backend
  // records each line (utils.LineAmount: qty in thousandths x rate in paisa)
  const totalPaisa = items.reduce((sum, item) => {
    const qtyThousandths = Math.round((Number(item.quantity) || 0) * 1000);
    const ratePaisa = Math.round((Number(item.rate) || 0) * 100);
    return sum + Math.floor((qtyThousandths * ratePaisa + 500) / 1000);
  }, 0);
  const total = totalPaisa / 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="border border-[rgba(47,78,64,0.18)]">
        {/* phones: each row is a grid (product full width, then qty / rate /
            remove); sm and up: a regular table */}
        <table className="block w-full border-collapse sm:table">
          <thead className="hidden sm:table-header-group">
            <tr>
              <th className={inventoryThClass}>Product</th>
              <th className={inventoryThClass}>Qty</th>
              <th className={inventoryThClass}>Rate (Rs.)</th>
              <th className={inventoryThClass} />
            </tr>
          </thead>
          <tbody className="block sm:table-row-group">
            {items.map((item) => {
              const itemErrors = errors?.[item.key];
              return (
                <tr
                  key={item.key}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] border-b border-[rgba(47,78,64,0.08)] last:border-b-0 sm:table-row"
                >
                  <td className={cn(cellClass, "col-span-3 sm:table-cell")}>
                    <SearchableSelect
                      value={item.productID}
                      onChange={(value, label) =>
                        updateItem(item.key, {
                          productID: value,
                          productName: label,
                        })
                      }
                      onSearch={onSearchProducts}
                      placeholder="Search product…"
                      selectedLabel={item.productName}
                    />
                    {itemErrors?.productID ? (
                      <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#9a3412]">
                        {itemErrors.productID}
                      </span>
                    ) : null}
                  </td>
                  <td className={cellClass}>
                    <span className={mobileLabelClass}>Qty</span>
                    <input
                      type="number"
                      aria-label="Quantity"
                      min={0.001}
                      step={0.001}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.key, { quantity: e.target.value })
                      }
                      className={cn(inventoryFieldInputClass, "w-full sm:w-28")}
                    />
                    {itemErrors?.quantity ? (
                      <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#9a3412]">
                        {itemErrors.quantity}
                      </span>
                    ) : null}
                  </td>
                  <td className={cellClass}>
                    <span className={mobileLabelClass}>Rate (Rs.)</span>
                    <input
                      type="number"
                      aria-label="Rate (Rs.)"
                      min={0.01}
                      step={0.01}
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.key, { rate: e.target.value })
                      }
                      className={cn(inventoryFieldInputClass, "w-full sm:w-28")}
                    />
                    {itemErrors?.rate ? (
                      <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#9a3412]">
                        {itemErrors.rate}
                      </span>
                    ) : null}
                  </td>
                  <td className={cn(cellClass, "text-right")}>
                    {/* phones: a blank label + py-3 (38px input - 14px icon) / 2
                        keeps the button level with the inputs, even when
                        error text makes the row taller */}
                    <span
                      aria-hidden
                      className={cn(mobileLabelClass, "invisible")}
                    >
                      &nbsp;
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      disabled={items.length <= 1}
                      className="py-3 text-[rgba(47,78,64,0.45)] hover:text-[#9a3412] disabled:cursor-not-allowed disabled:opacity-30 sm:py-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addItem}
          className={cn(adminSecondaryButtonClass, "gap-1.5")}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add item
        </button>
        <span className="font-(family-name:--font-dm-sans) text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]">
          Total: Rs. {total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
