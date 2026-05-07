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
import { Label } from "@/components/ui/label";
import { UnitCombobox } from "./UnitComboBox";
import {
  type CreateProductInput,
  CreateProductResponse,
  createProductSchema,
  GetProductResponse,
} from "@repo/types/inventory";
import { toast } from "sonner";
import { useState } from "react";

type Product = Extract<GetProductResponse, { success: true }>["data"][number];
type BackendError = Extract<CreateProductResponse, { success: false }>;

type ProductDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProductInput) => Promise<void>;
  editingProduct?: Product | null;
};
type ProductFields = keyof CreateProductInput;

export function ProductDialog({
  open,
  onClose,
  onSubmit,
  editingProduct,
}: ProductDialogProps) {
  const [backendErrors, setBackendErrors] = useState<
    Partial<Record<ProductFields, string>>
  >({});

  const form = useForm({
    defaultValues: {
      name: editingProduct?.name ?? "",
      unit: editingProduct?.unit ?? "pieces",
    },

    validators: {
      onSubmit: createProductSchema,
    },
    onSubmitInvalid: ({ formApi }) => {
      formApi.validate("submit");
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSubmit(value);
        formApi.reset();
        onClose();
      } catch (err) {
        const error = err as BackendError;
        toast.error(error?.message ?? "Something went wrong");
        if (error?.errors?.length) {
          const mapped: Partial<Record<ProductFields, string>> = {};
          for (const fieldErr of error.errors) {
            mapped[fieldErr.field as ProductFields] = fieldErr.message;
          }
          setBackendErrors(mapped);
        } else {
          toast.error(error?.message ?? "Something went wrong");
        }
      }
    },
  });

  const handleClose = () => {
    form.reset();
    setBackendErrors({});
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
          <form.Field name="name">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? backendErrors.name;

              return (
                <div className="space-y-1.5">
                  <Label
                    className="text-sm font-medium text-[var(--brand-ink)]"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Product Name
                    <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setBackendErrors((prev) => ({
                        ...prev,
                        name: undefined,
                      }));
                    }}
                    onBlur={field.handleBlur}
                    placeholder="e.g. T-Shirt"
                    className="border-[var(--brand-ink)]/20 bg-white focus-visible:ring-[var(--brand-green)]"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  />
                  {mergedError && (
                    <p
                      className="text-xs text-red-500"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {mergedError}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Unit field */}
          <form.Field name="unit">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? backendErrors.unit;

              return (
                <div className="space-y-1.5">
                  <Label
                    className="text-sm font-medium text-[var(--brand-ink)]"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Unit
                    <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <UnitCombobox
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v);
                      setBackendErrors((prev) => ({
                        ...prev,
                        unit: undefined,
                      }));
                    }}
                    onBlur={field.handleBlur}
                  />
                  {mergedError && (
                    <p
                      className="text-xs text-red-500"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {mergedError}
                    </p>
                  )}
                </div>
              );
            }}
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
