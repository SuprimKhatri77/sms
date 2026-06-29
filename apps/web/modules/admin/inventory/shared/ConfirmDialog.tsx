"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ConfirmDialog({
  open,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm gap-0 border border-[rgba(47,78,64,0.18)] bg-(--brand-cream) p-0">
        <DialogHeader className="border-b border-[rgba(47,78,64,0.12)] px-5 py-4 text-left">
          <DialogTitle className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
            Delete {itemName}?
          </DialogTitle>
          <DialogDescription className="font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
            This action cannot be undone. The record will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 px-5 py-4 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={adminSecondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              adminPrimaryButtonClass,
              "border-[#9a3412] bg-[#9a3412] hover:bg-[#7c2d12]",
            )}
          >
            {isLoading ? "Deleting…" : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
