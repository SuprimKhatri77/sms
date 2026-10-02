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
        try {
          await onConfirm(account.id);
        } catch {
          // The delete mutation already toasts why it failed (e.g. the
          // record is still in use); retrying won't help, so just close.
        }
        onClose();
      }}
    />
  );
}
