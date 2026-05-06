"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockProducts, mockStockIn } from "../lib/mock-data";
import type { StockOut, Product } from "../types";
import { CENTS_DIVISOR } from "../lib/utils";

const stockOutSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  date: z.string().min(1, "Date is required"),
  bill_no: z.string().optional(),
  qty: z.number({ error: "Qty must be a number" }).min(1, "Min 1"),
  rate: z.number({ error: "Rate must be a number" }).min(0.01, "Rate required"),
  note: z.string().optional(),
});

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<StockOut, "id" | "created_at" | "product_name" | "product_unit">,
  ) => Promise<void>;
  initialData?: StockOut | null;
};

/** Returns the latest stock_in rate (in Rs, already divided by 100) for a product */
function getLatestRate(productId: string): number {
  const entries = mockStockIn
    .filter((s) => s.product_id === productId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return entries.length > 0 ? entries[0].rate / CENTS_DIVISOR : 0;
}

export function StockOutDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const isEdit = !!initialData;

  const form = useForm({
    defaultValues: {
      product_id: initialData?.product_id ?? "",
      date: initialData?.date ?? "",
      bill_no: initialData?.bill_no ?? "",
      qty: initialData?.qty ?? 1,
      rate: initialData ? initialData.rate / CENTS_DIVISOR : 0,
      note: initialData?.note ?? "",
    },
    validators: { onSubmit: stockOutSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({
        product_id: value.product_id,
        date: value.date,
        bill_no: value.bill_no || null,
        qty: value.qty,
        rate: Math.round(value.rate * CENTS_DIVISOR),
        note: value.note || null,
      });
      form.reset();
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-[var(--brand-cream)] border-[var(--brand-green)]/20">
        <DialogHeader>
          <DialogTitle className="font-[var(--font-playfair)] text-[var(--brand-green)] text-xl">
            {isEdit ? "Edit Stock Out" : "Add Stock Out"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Product */}
          <form.Field name="product_id">
            {(field) => (
              <div className="space-y-1">
                <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                  Product <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => {
                    field.handleChange(v);
                    // Autofill rate from latest stock-in for this product
                    const latestRate = getLatestRate(v);
                    form.setFieldValue("rate", latestRate);
                  }}
                >
                  <SelectTrigger className="border-[var(--brand-green)]/30 focus:ring-[var(--brand-green)]">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((p: Product) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Date */}
          <form.Field name="date">
            {(field) => (
              <div className="space-y-1">
                <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                  Date (BS) <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="2081-01-15"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Bill No */}
          <form.Field name="bill_no">
            {(field) => (
              <div className="space-y-1">
                <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                  Bill No{" "}
                  <span className="text-[var(--brand-brown)] text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  placeholder="BILL-001"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
                />
              </div>
            )}
          </form.Field>

          {/* Qty + Rate */}
          <div className="grid grid-cols-2 gap-3">
            <form.Field name="qty">
              {(field) => (
                <div className="space-y-1">
                  <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                    Qty <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="rate">
              {(field) => (
                <div className="space-y-1">
                  <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                    Rate (Rs.) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Note */}
          <form.Field name="note">
            {(field) => (
              <div className="space-y-1">
                <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                  Note{" "}
                  <span className="text-[var(--brand-brown)] text-xs">
                    (optional)
                  </span>
                </Label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-[var(--brand-green)]/30 bg-white px-3 py-2 text-sm font-[var(--font-dm-sans)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-green)]"
                  placeholder="Optional note..."
                />
              </div>
            )}
          </form.Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[var(--brand-green)]/30 text-[var(--brand-ink)]"
            >
              Cancel
            </Button>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white font-[var(--font-dm-sans)]"
                >
                  {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
