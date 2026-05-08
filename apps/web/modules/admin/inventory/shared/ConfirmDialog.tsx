"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="bg-[var(--brand-cream)] border border-[var(--brand-ink)]/10 max-w-sm">
        <DialogHeader>
          <DialogTitle
            className="text-[var(--brand-ink)]"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Delete {itemName}?
          </DialogTitle>
          <DialogDescription
            className="text-[var(--brand-ink)]/60 text-sm"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            This action cannot be undone. The record will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-[var(--brand-ink)]/20 text-[var(--brand-ink)] hover:bg-[var(--brand-ink)]/5"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {isLoading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
