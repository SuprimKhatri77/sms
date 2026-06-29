"use client";

import { BankAccount } from "@repo/types";
import { ConfirmDialog } from "../../inventory/shared/ConfirmDialog";

interface BankAccountDeleteDialogProps {
  account: BankAccount | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function BankAccountDeleteDialog({
  account,
  loading,
  onClose,
  onConfirm,
}: BankAccountDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={!!account}
      itemName={account?.accountName ?? "account"}
      isLoading={loading}
      onCancel={onClose}
      onConfirm={async () => {
        if (!account) return;
        await onConfirm(account.id);
        onClose();
      }}
    />
  );
}
