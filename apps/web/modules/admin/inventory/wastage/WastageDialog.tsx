// modules/admin/inventory/components/wastage/WastageDialog.tsx
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
import type { Wastage, Product } from "../types";
import { CENTS_DIVISOR } from "../lib/utils";

const wastageSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  date: z.string().min(1, "Date is required"),
  qty: z.number({ error: "Qty must be a number" }).min(1, "Min 1"),
  rate: z.number({ error: "Rate must be a number" }).min(0.01, "Rate required"),
  reason: z.string().optional(),
});

type WastageFormValues = z.infer<typeof wastageSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Wastage, "id" | "created_at" | "product_name" | "product_unit">,
  ) => Promise<void>;
  initialData?: Wastage | null;
};

function getLatestRate(productId: string): number {
  const entries = mockStockIn
    .filter((s) => s.product_id === productId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return entries.length > 0 ? entries[0].rate / CENTS_DIVISOR : 0;
}

export function WastageDialog({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData;

  const form = useForm({
    defaultValues: {
      product_id: initialData?.product_id ?? "",
      date: initialData?.date ?? "",
      qty: initialData?.qty ?? 1,
      rate: initialData ? initialData.rate / CENTS_DIVISOR : 0,
      reason: initialData?.reason ?? "",
    },
    validators: { onSubmit: wastageSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({
        product_id: value.product_id,
        date: value.date,
        qty: value.qty,
        rate: Math.round(value.rate * CENTS_DIVISOR),
        reason: value.reason || null,
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
            {isEdit ? "Edit Wastage" : "Log Wastage"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="product_id">
            {(field) => (
              <div className="space-y-1">
                <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                  Product <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => {
                    field.handleChange(v as string);
                    form.setFieldValue("rate", getLatestRate(v as string));
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

          <form.Field name="reason">
            {(field) => (
              <div className="space-y-1">
                <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                  Reason{" "}
                  <span className="text-[var(--brand-brown)] text-xs">
                    (optional)
                  </span>
                </Label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-[var(--brand-green)]/30 bg-white px-3 py-2 text-sm font-[var(--font-dm-sans)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-green)]"
                  placeholder="e.g. Damaged in transit..."
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
                  {isSubmitting
                    ? "Saving..."
                    : isEdit
                      ? "Update"
                      : "Log Wastage"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
