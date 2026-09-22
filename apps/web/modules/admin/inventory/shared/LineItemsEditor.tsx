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

  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return sum + qty * rate;
  }, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto border border-[rgba(47,78,64,0.18)]">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr>
              <th className={inventoryThClass}>Product</th>
              <th className={inventoryThClass}>Qty</th>
              <th className={inventoryThClass}>Rate (Rs.)</th>
              <th className={inventoryThClass} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const itemErrors = errors?.[item.key];
              return (
                <tr
                  key={item.key}
                  className="border-b border-[rgba(47,78,64,0.08)] last:border-b-0"
                >
                  <td className={cellClass}>
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
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.key, { quantity: e.target.value })
                      }
                      className={cn(inventoryFieldInputClass, "w-24")}
                    />
                    {itemErrors?.quantity ? (
                      <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#9a3412]">
                        {itemErrors.quantity}
                      </span>
                    ) : null}
                  </td>
                  <td className={cellClass}>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.key, { rate: e.target.value })
                      }
                      className={cn(inventoryFieldInputClass, "w-28")}
                    />
                    {itemErrors?.rate ? (
                      <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#9a3412]">
                        {itemErrors.rate}
                      </span>
                    ) : null}
                  </td>
                  <td className={cn(cellClass, "text-right")}>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      disabled={items.length <= 1}
                      className="text-[rgba(47,78,64,0.45)] hover:text-[#9a3412] disabled:cursor-not-allowed disabled:opacity-30"
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
