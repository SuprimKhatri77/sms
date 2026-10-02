"use client";

import { Supplier } from "@repo/types";
import { ConfirmDialog } from "../../inventory/shared/ConfirmDialog";

interface SupplierDeleteDialogProps {
  supplier: Supplier | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function SupplierDeleteDialog({
  supplier,
  loading,
  onClose,
  onConfirm,
}: SupplierDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={!!supplier}
      itemName={supplier?.companyName ?? "supplier"}
      isLoading={loading}
      onCancel={onClose}
      onConfirm={async () => {
        if (!supplier) return;
        try {
          await onConfirm(supplier.id);
        } catch {
          // The delete mutation already toasts why it failed (e.g. the
          // record is still in use); retrying won't help, so just close.
        }
        onClose();
      }}
    />
  );
}
