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
import { formatCreatedAt } from "../lib/utils";
import { GetProductResponse } from "@repo/types";

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
    <div className="rounded-lg border border-[var(--brand-ink)]/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--brand-green)] hover:bg-[var(--brand-green)]">
            <TableHead
              className="text-white font-semibold"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Name
            </TableHead>
            <TableHead
              className="text-white font-semibold"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Unit
            </TableHead>
            <TableHead
              className="text-white font-semibold"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Created At
            </TableHead>
            <TableHead
              className="text-white font-semibold text-right"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, i) => (
            <TableRow
              key={product.id}
              className={
                i % 2 === 0
                  ? "bg-white hover:bg-[var(--brand-cream)]"
                  : "bg-[var(--brand-cream)] hover:bg-[var(--brand-cream)]/70"
              }
            >
              <TableCell
                className="font-medium text-[var(--brand-ink)]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {product.name}
              </TableCell>
              <TableCell
                className="text-[var(--brand-ink)]/70"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {product.unit}
              </TableCell>
              <TableCell
                className="text-[var(--brand-ink)]/70"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {formatCreatedAt(String(product.createdAt))}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 text-[var(--brand-ink)]/60 hover:text-[var(--brand-green)] hover:bg-[var(--brand-green)]/10"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product)}
                    className="h-8 w-8 text-[var(--brand-ink)]/60 hover:text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
