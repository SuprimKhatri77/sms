"use client";

import { EmptyState } from "../../inventory/shared/EmptyState";

interface SuppliersEmptyProps {
  onAdd: () => void;
}

export function SuppliersEmpty({ onAdd: _onAdd }: SuppliersEmptyProps) {
  return (
    <EmptyState message="No suppliers yet. Add your first supplier to start tracking purchases and payments." />
  );
}
