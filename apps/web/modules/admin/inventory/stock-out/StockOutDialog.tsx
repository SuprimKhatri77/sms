"use client";

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
import {
  CreateStockOutInput,
  CreateStockOutResponse,
  createStockOutSchema,
  GetProductResponse,
  ListStockOutResponse,
} from "@repo/types";
import { useEffect, useMemo, useState } from "react";
import { mapFieldErrors } from "@/utils/api";
import { toast } from "sonner";

type StockOut = Extract<
  ListStockOutResponse,
  { success: true }
>["data"][number];
type BackendError = Extract<CreateStockOutResponse, { success: false }>;
type StockOutFormData = Omit<
  StockOut,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};
type Product = Extract<GetProductResponse, { success: true }>["data"][number];
type Props = {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSubmit: (data: StockOutFormData) => void;
  initialData?: StockOut | null;
  stockOut: StockOut[];
};

const EMPTY_FORM = {
  billNo: "",
  note: "",
  productID: "",
  quantity: "1",
  rate: "",
  date: "",
};

export function StockOutDialog({
  open,
  onClose,
  onSubmit,
  products,
  initialData,
}: Props) {
  const [isEdit, setIsEdit] = useState(!!initialData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] =
    useState<Partial<Record<keyof CreateStockOutInput, string>>>();

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      setIsEdit(!!initialData);
      setErrors({});
    }, 0);
    if (initialData) {
      setTimeout(() => {
        setFormData({
          billNo: initialData.billNo ?? "",
          note: initialData.note ?? "",
          productID: initialData.productID ?? "",
          quantity: initialData.qty.toString(),
          rate: (initialData.rate / 100).toString(),
          date: initialData.date ?? "",
        });
      }, 0);
    } else {
      setTimeout(() => {
        setFormData(EMPTY_FORM);
      }, 0);
    }
  }, [open]);

  const handleSubmit = async (data: CreateStockOutInput) => {
    setIsSubmitting(true);
    const validateFields = createStockOutSchema.safeParse(data);
    if (!validateFields.success) {
      setIsSubmitting(false);
      const tree = z.treeifyError(validateFields.error).properties;
      setErrors({
        note: tree?.note?.errors[0],
        quantity: tree?.quantity?.errors[0],
        productID: tree?.productID?.errors[0],
        rate: tree?.rate?.errors[0],
        billNo: tree?.billNo?.errors[0],
        date: tree?.date?.errors[0],
      });
      return;
    }
    try {
      await onSubmit(data);
      setFormData(EMPTY_FORM);
      setErrors({});
      onClose();
    } catch (err) {
      const error = err as BackendError;
      console.log("error: ", error);
      toast.error(error?.message ?? "Something went wrong");
      if (error?.errors?.length) {
        setErrors(mapFieldErrors(error));
      } else {
        toast.error(error?.message ?? "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = useMemo(() => {
    if (!formData.productID) return undefined;
    return products.find((p) => p.id === formData.productID);
  }, [products, formData.productID]);

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
            handleSubmit({
              ...formData,
              quantity: Number(formData.quantity),
              rate: Number(formData.rate),
            });
          }}
          className="space-y-4"
        >
          {/* Product */}

          <div className="space-y-1">
            <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
              Product <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.productID}
              onValueChange={(v) => {
                setFormData((prev) => ({
                  ...prev,
                  productID: v as string,
                }));
              }}
            >
              <SelectTrigger className="border-[var(--brand-green)]/30 focus:ring-[var(--brand-green)]">
                <SelectValue placeholder="Select product">
                  {selectedProduct ? selectedProduct.name : "Select product"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.productID && (
              <p className="text-xs text-red-500">{errors.productID}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
              Date (BS) <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="2081-01-15"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
            />
            {errors?.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Bill No */}
          <div className="space-y-1">
            <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
              Bill No{" "}
              <span className="text-[var(--brand-brown)] text-xs">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="BILL-001"
              value={formData.billNo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, billNo: e.target.value }))
              }
              className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
            />
          </div>

          {/* Qty + Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                Qty <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
              />
              {errors?.quantity && (
                <p className="text-xs text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
                Rate (Rs.) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={formData.rate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rate: e.target.value }))
                }
                className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
              />
              {errors?.rate && (
                <p className="text-xs text-red-500">{errors.rate}</p>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
              Note{" "}
              <span className="text-[var(--brand-brown)] text-xs">
                (optional)
              </span>
            </Label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              rows={2}
              className="w-full rounded-md border border-[var(--brand-green)]/30 bg-white px-3 py-2 text-sm font-[var(--font-dm-sans)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-green)]"
              placeholder="Optional note..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[var(--brand-green)]/30 text-[var(--brand-ink)]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white font-[var(--font-dm-sans)]"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
