"use client";

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
  CreateStockInInput,
  CreateStockInResponse,
  createStockInSchema,
  GetProductResponse,
  ListStockInResponse,
} from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import StockInError from "./StockInError";
import { useEffect, useMemo, useState } from "react";
import z from "zod";
import { toast } from "sonner";
import { mapFieldErrors } from "@/utils/api";

type StockIn = Extract<ListStockInResponse, { success: true }>["data"][number];
type BackendError = Extract<CreateStockInResponse, { success: false }>;

type StockInFormData = Omit<
  StockIn,
  "id" | "createdAt" | "productName" | "productUnit" | "updatedAt" | "qty"
> & {
  quantity: number;
};

type Product = Extract<GetProductResponse, { success: true }>["data"][number];

type Props = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (data: StockInFormData) => Promise<void>;
  initialData?: StockIn | null;
};

export function StockInDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  products,
}: Props) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFromData] = useState({
    invoiceNo: initialData?.invoiceNo ?? "",
    note: initialData?.note ?? "",
    productID: initialData?.productID ?? "",
    quantity: initialData?.qty?.toString() ?? "1",
    rate: initialData?.rate ? (initialData.rate / 100).toString() : "",
    date: initialData?.date ?? "",
  });
  useEffect(() => {
    if (initialData) {
      setTimeout(() => {
        setFromData({
          invoiceNo: initialData.invoiceNo ?? "",
          note: initialData.note ?? "",
          productID: initialData.productID ?? "",
          quantity: initialData.qty.toString(),
          rate: (initialData.rate / 100).toString(),
          date: initialData.date ?? "",
        });
      }, 0);
    } else {
      setTimeout(() => {
        setFromData({
          invoiceNo: "",
          note: "",
          productID: "",
          quantity: "1",
          rate: "",
          date: "",
        });
      }, 0);
    }
  }, [initialData]);
  const [errors, setErrors] =
    useState<Partial<Record<keyof CreateStockInInput, string>>>();

  const handleSubmit = async (data: CreateStockInInput) => {
    setIsSubmitting(true);
    const validateFields = createStockInSchema.safeParse(data);
    if (!validateFields.success) {
      setIsSubmitting(false);
      const tree = z.treeifyError(validateFields.error).properties;
      setErrors({
        note: tree?.note?.errors[0],
        quantity: tree?.quantity?.errors[0],
        productID: tree?.productID?.errors[0],
        rate: tree?.rate?.errors[0],
        invoiceNo: tree?.invoiceNo?.errors[0],
        date: tree?.date?.errors[0],
      });
      return;
    }
    try {
      await onSubmit(data);
      setFromData({
        invoiceNo: "",
        note: "",
        productID: "",
        quantity: "1",
        rate: "",
        date: "",
      });
      setErrors({});
      onClose();
    } catch (err) {
      const error = err as BackendError;
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
    if (!products || !formData.productID) return undefined;
    return products.find((p) => p.id === formData.productID);
  }, [products, formData.productID]);

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
              onValueChange={(v) =>
                setFromData((prev) => ({
                  ...prev,
                  productID: v as string,
                }))
              }
            >
              <SelectTrigger className="border-[var(--brand-green)]/30 focus:ring-[var(--brand-green)]">
                <SelectValue placeholder="Select product">
                  {selectedProduct?.name}
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

          {/* Date (BS) */}
          <div className="space-y-1">
            <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
              Date (BS) <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="2081-01-15"
              value={formData.date}
              onChange={(e) =>
                setFromData((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
            />
            {errors?.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Invoice No */}
          <div className="space-y-1">
            <Label className="font-[var(--font-dm-sans)] text-[var(--brand-ink)]">
              Invoice No{" "}
              <span className="text-[var(--brand-brown)] text-xs">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="INV-001"
              value={formData.invoiceNo}
              onChange={(e) =>
                setFromData((prev) => ({
                  ...prev,
                  invoiceNo: e.target.value,
                }))
              }
              className="border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)]"
            />
          </div>

          {/* Qty + Rate side by side */}
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
                  setFromData((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
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
                  setFromData((prev) => ({
                    ...prev,
                    rate: e.target.value,
                  }))
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
                setFromData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
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
