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
        await onConfirm(bank.id);
        onClose();
      }}
    />
  );
}
