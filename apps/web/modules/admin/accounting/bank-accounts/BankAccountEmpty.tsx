"use client";

import { EmptyState } from "../../inventory/shared/EmptyState";

interface BankAccountsEmptyProps {
  onAdd: () => void;
}

export function BankAccountsEmpty({ onAdd: _onAdd }: BankAccountsEmptyProps) {
  return (
    <EmptyState message="No bank accounts yet. Add your first account to manage payment channels for the academy." />
  );
}
