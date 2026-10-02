"use client";

import { Bank } from "@repo/types";
import { ConfirmDialog } from "../../inventory/shared/ConfirmDialog";

interface BankDeleteDialogProps {
  bank: Bank | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function BankDeleteDialog({
  bank,
  loading,
  onClose,
  onConfirm,
}: BankDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={!!bank}
      itemName={bank?.name ?? "bank"}
      isLoading={loading}
      onCancel={onClose}
      onConfirm={async () => {
        if (!bank) return;
        try {
          await onConfirm(bank.id);
        } catch {
          // The delete mutation already toasts why it failed (e.g. the
          // record is still in use); retrying won't help, so just close.
        }
        onClose();
      }}
    />
  );
}
