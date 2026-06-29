"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatCreatedAt } from "../lib/utils";
import { GetProductResponse } from "@repo/types";
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

type Product = Extract<GetProductResponse, { success: true }>["data"][number];

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsTable({
  products,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <div className={inventoryTableWrapClass}>
      <div className={inventoryTableScrollClass}>
        <table className={inventoryTableClass}>
          <thead>
            <tr>
              <th className={inventoryThClass}>Name</th>
              <th className={inventoryThClass}>Unit</th>
              <th className={inventoryThClass}>Created</th>
              <th className={`${inventoryThClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-[rgba(47,78,64,0.02)]"
              >
                <td className={`${inventoryTdClass} font-medium`}>
                  {product.name}
                </td>
                <td className={`${inventoryTdClass} text-[rgba(47,78,64,0.6)]`}>
                  {product.unit}
                </td>
                <td className={`${inventoryTdClass} text-[rgba(47,78,64,0.6)]`}>
                  {formatCreatedAt(String(product.createdAt))}
                </td>
                <td className={`${inventoryTdClass} text-right`}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className={adminIconButtonClass}
                      aria-label={`Edit ${product.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className={adminDangerIconButtonClass}
                      aria-label={`Delete ${product.name}`}
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
    </div>
  );
}
