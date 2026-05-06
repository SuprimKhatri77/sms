"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_UNITS } from "../lib/utils";
import type { Product, ProductFormValues } from "../types";
import { FormField } from "../shared/FormField";

type ProductDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  editingProduct?: Product | null;
};

export function ProductDialog({
  open,
  onClose,
  onSubmit,
  editingProduct,
}: ProductDialogProps) {
  const form = useForm({
    defaultValues: {
      name: editingProduct?.name ?? "",
      unit: editingProduct?.unit ?? "pieces",
    } satisfies ProductFormValues,
    onSubmit: async ({ value }) => {
      // Validate manually since we're not using zod here
      if (!value.name.trim()) return;
      await onSubmit(value);
      form.reset();
      onClose();
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-[var(--brand-cream)] border border-[var(--brand-ink)]/10 max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-[var(--brand-ink)] text-xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {editingProduct ? "Edit Product" : "New Product"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4 pt-2"
        >
          {/* Name field */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? "Product name is required" : undefined,
            }}
          >
            {(field) => (
              <FormField
                label="Product Name"
                error={field.state.meta.errors[0]}
                required
              >
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. T-Shirt"
                  className="border-[var(--brand-ink)]/20 bg-white focus-visible:ring-[var(--brand-green)]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                />
              </FormField>
            )}
          </form.Field>

          {/* Unit field */}
          <form.Field
            name="unit"
            validators={{
              onChange: ({ value }) =>
                !value ? "Please select a unit" : undefined,
            }}
          >
            {(field) => (
              <FormField
                label="Unit"
                error={field.state.meta.errors[0]}
                required
              >
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as string)}
                >
                  <SelectTrigger
                    className="border-[var(--brand-ink)]/20 bg-white focus:ring-[var(--brand-green)]"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          </form.Field>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={form.state.isSubmitting}
              className="border-[var(--brand-ink)]/20 text-[var(--brand-ink)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.state.isSubmitting || !form.state.canSubmit}
              className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {form.state.isSubmitting
                ? "Saving…"
                : editingProduct
                  ? "Save Changes"
                  : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
