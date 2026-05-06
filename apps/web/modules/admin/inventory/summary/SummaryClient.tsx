"use client";

import { useState } from "react";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { SummaryTable } from "./SummaryTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Filter } from "lucide-react";
import {
  mockSummary,
  mockStockIn,
  mockStockOut,
  mockWastage,
  mockProducts,
} from "../lib/mock-data";
import { computeSummary } from "../lib/utils";
import type { InventorySummaryRow } from "../types";

export function SummaryClient() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filtered, setFiltered] = useState<InventorySummaryRow[] | null>(null);

  const displayData = filtered ?? mockSummary;

  const handleFilter = () => {
    if (!fromDate && !toDate) {
      setFiltered(null);
      return;
    }
    // Re-compute summary from filtered mock transactions
    const filteredStockIn = mockStockIn.filter((r) => {
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      return true;
    });
    const filteredStockOut = mockStockOut.filter((r) => {
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      return true;
    });
    const filteredWastage = mockWastage.filter((r) => {
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      return true;
    });
    setFiltered(
      computeSummary(
        mockProducts,
        filteredStockIn,
        filteredStockOut,
        filteredWastage,
      ),
    );
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setFiltered(null);
  };

  return (
    <div className="space-y-6 min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <InventoryPageHeader
        title="Inventory Summary"
        description="Overview of stock levels and valuations across all products."
        action={
          <Button
            variant="outline"
            className="border-[var(--brand-green)]/30 text-[var(--brand-green)] gap-2 font-[var(--font-dm-sans)]"
          >
            <Download size={15} /> Export
          </Button>
        }
      />

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border border-[var(--brand-green)]/15 bg-[var(--brand-green)]/3">
        <div className="space-y-1">
          <Label className="font-[var(--font-dm-sans)] text-sm text-[var(--brand-ink)]">
            From (BS)
          </Label>
          <Input
            placeholder="2081-01-01"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-36 border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)] bg-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="font-[var(--font-dm-sans)] text-sm text-[var(--brand-ink)]">
            To (BS)
          </Label>
          <Input
            placeholder="2081-12-30"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-36 border-[var(--brand-green)]/30 focus-visible:ring-[var(--brand-green)] bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleFilter}
            className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-2)] text-white font-[var(--font-dm-sans)] gap-2"
          >
            <Filter size={14} /> Apply
          </Button>
          {filtered && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-[var(--brand-green)]/30 text-[var(--brand-ink)]"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <SummaryTable data={displayData} />
    </div>
  );
}
