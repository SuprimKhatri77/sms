"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Table } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { downloadExport, type ExportFormat } from "@/lib/api/export";
import { adminSecondaryButtonClass } from "./admin-styles";

const EXPORT_OPTIONS: {
  format: ExportFormat;
  label: string;
  icon: typeof Download;
}[] = [
  { format: "csv", label: "CSV", icon: Table },
  { format: "xlsx", label: "Excel", icon: FileSpreadsheet },
  { format: "pdf", label: "PDF", icon: FileText },
];

type AdminExportMenuProps = {
  // Export endpoint, e.g. "/admin/students/payments/export".
  path: string;
  // The list's current filters (without page); empty values are dropped.
  filters: Record<string, string>;
};

// "Export" button offering CSV / Excel / PDF of every row matching the
// list's current filters, not just the page on screen.
export function AdminExportMenu({ path, filters }: AdminExportMenuProps) {
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(
    null,
  );

  async function handleExport(format: ExportFormat) {
    setPendingFormat(format);
    try {
      await downloadExport(path, filters, format);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setPendingFormat(null);
    }
  }

  const isPending = pendingFormat !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={cn(
          adminSecondaryButtonClass,
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isPending ? <Spinner className="size-3.5" /> : <Download size={14} />}
        {isPending ? "Exporting…" : "Export"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {EXPORT_OPTIONS.map(({ format, label, icon: Icon }) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            className="cursor-pointer font-(family-name:--font-dm-sans)"
          >
            <Icon size={14} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
