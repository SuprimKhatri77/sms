"use client";

import { EmptyState } from "../../inventory/shared/EmptyState";

interface BanksEmptyProps {
  onAdd: () => void;
}

export function BanksEmpty({ onAdd: _onAdd }: BanksEmptyProps) {
  return (
    <EmptyState message="No banks yet. Add your first bank to start processing payments." />
  );
}
