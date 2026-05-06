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
import { mockProducts } from "../lib/mock-data";
import type { StockIn, Product } from "../types";

const stockInSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  date: z.string().min(1, "Date is required"),
  invoice_no: z.string().optional(),
  qty: z.number({ error: "Qty must be a number" }).min(1, "Min 1"),
  // User enters in Rs; we multiply ×100 before saving
  rate: z.number({ error: "Rate must be a number" }).min(0.01, "Rate required"),
  note: z.string().optional(),
});

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<StockIn, "id" | "created_at" | "product_name" | "product_unit">,
  ) => Promise<void>;
  initialData?: StockIn | null;
};

export function StockInDialog({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData;

  const form = useForm({
    defaultValues: {
      product_id: initialData?.product_id ?? "",
      date: initialData?.date ?? "",
      invoice_no: initialData?.invoice_no ?? "",
      qty: initialData?.qty ?? 1,
      rate: initialData ? initialData.rate / 100 : 0,
      note: initialData?.note ?? "",
    },
    validators: {
      onChange: stockInSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        product_id: value.product_id,
        date: value.date,
        invoice_no: value.invoice_no || null,
        qty: value.qty,
        // multiply ×100 to convert Rs → cents before sending to backend
        rate: Math.round(value.rate * 100),
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
            {isEdit ? "Edit Stock In" : "Add Stock In"}
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
                  onValueChange={(v) => field.handleChange(v)}
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

          {/* Date (BS) */}
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

          {/* Invoice No */}
          <form.Field name="invoice_no">
            {(field) => (
              <div className="space-y-1">
                <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                  Invoice No{" "}
                  <span className="text-[var(--brand-brown)] text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  placeholder="INV-001"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
                />
              </div>
            )}
          </form.Field>

          {/* Qty + Rate side by side */}
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
