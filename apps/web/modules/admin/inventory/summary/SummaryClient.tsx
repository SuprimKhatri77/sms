"use client";

import { useState } from "react";
import { SummaryTable } from "./SummaryTable";
import { CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { InventorySummaryResponse } from "@repo/types";
import api from "@/lib/axios";
import SummaryLoading from "./SummaryLoading";
import SummaryError from "./SummaryError";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { inputCls } from "../../students/detail/shared/utils";
import { cn } from "@/lib/utils";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { InventoryFilterShell } from "../shared/InventoryFilterShell";
import { inventoryLabelClass } from "../shared/inventory-styles";

export function SummaryClient() {
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const hasActiveFilter = !!fromDate || !!toDate;
  const hasPendingChange = pendingFrom !== fromDate || pendingTo !== toDate;

  const { data, isPending, isError, refetch, error } = useQuery({
    queryKey: ["admin-inventory-summary", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const query = params.toString();
      const res = await api.get<InventorySummaryResponse>(
        `/admin/inventory/summary${query ? `?${query}` : ""}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleApply = () => {
    setFromDate(pendingFrom);
    setToDate(pendingTo);
  };

  const handleClear = () => {
    setPendingFrom("");
    setPendingTo("");
    setFromDate("");
    setToDate("");
  };

  return (
    <AdminPageLayout
      title="Inventory Summary"
      description="Overview of stock levels and valuations across all products."
      maxWidth="wide"
    >
      <InventoryFilterShell
        title="Date Range (BS)"
        hasActiveFilters={hasActiveFilter}
        onClear={handleClear}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className={inventoryLabelClass}>From</span>
            <div className="relative w-full">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                strokeWidth={1.75}
              />
              <NepaliDatePicker
                inputClassName={cn(inputCls, "rounded-none pl-9")}
                value={pendingFrom}
                onChange={(v: string) => setPendingFrom(v)}
                options={{ calenderLocale: "en", valueLocale: "en" }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={inventoryLabelClass}>To</span>
            <div className="relative w-full">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
                strokeWidth={1.75}
              />
              <NepaliDatePicker
                inputClassName={cn(inputCls, "rounded-none pl-9")}
                value={pendingTo}
                onChange={(v: string) => setPendingTo(v)}
                options={{ calenderLocale: "en", valueLocale: "en" }}
              />
            </div>
          </div>
        </div>
        {hasPendingChange ? (
          <button
            type="button"
            onClick={handleApply}
            className={cn(adminPrimaryButtonClass, "mt-4")}
          >
            Apply dates
          </button>
        ) : null}
      </InventoryFilterShell>

      {isPending || !data ? (
        <SummaryLoading />
      ) : isError ? (
        <SummaryError error={error} reset={refetch} />
      ) : !data.success ? (
        <SummaryError
          error={{ ...data, message: "Failed to process request" }}
          reset={refetch}
        />
      ) : (
        <SummaryTable data={data.data} />
      )}
    </AdminPageLayout>
  );
}
