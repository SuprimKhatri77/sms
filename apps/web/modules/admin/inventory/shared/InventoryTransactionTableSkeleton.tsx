import { cn } from "@/lib/utils";
import {
  inventoryFilterPanelClass,
  inventoryTableWrapClass,
  inventoryThClass,
} from "./inventory-styles";

function Skel({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)}
      aria-hidden
    />
  );
}

const STOCK_IN_OUT_HEADERS = [
  "Product",
  "Date (BS)",
  "Ref No",
  "Qty",
  "Rate",
  "Amount",
  "Note",
  "Actions",
] as const;

const WASTAGE_HEADERS = [
  "Product",
  "Date (BS)",
  "Qty",
  "Rate",
  "Amount",
  "Reason",
  "Actions",
] as const;

const STOCK_IN_OUT_WIDTHS = ["18%", "11%", "12%", "8%", "10%", "12%", "19%", "10%"];
const WASTAGE_WIDTHS = ["22%", "12%", "10%", "12%", "14%", "20%", "10%"];

type TableVariant = "stock-in-out" | "wastage";

function TableColGroup({ variant }: { variant: TableVariant }) {
  const widths = variant === "wastage" ? WASTAGE_WIDTHS : STOCK_IN_OUT_WIDTHS;
  return (
    <colgroup>
      {widths.map((width, i) => (
        <col key={i} style={{ width }} />
      ))}
    </colgroup>
  );
}

export function InventoryTransactionFiltersSkeleton() {
  return (
    <div className={inventoryFilterPanelClass}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Skel className="h-3 w-16" />
      </div>
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
        <div className="flex flex-col gap-2 md:col-span-4">
          <Skel className="h-3 w-14" />
          <Skel className="h-11 w-full" />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Skel className="h-3 w-20" />
          <Skel className="h-11 w-full" />
        </div>
        <div className="flex flex-col gap-2 md:col-span-6">
          <Skel className="h-3 w-28" />
          <div className="flex flex-wrap items-center gap-2">
            <Skel className="h-11 min-w-[9rem] flex-1" />
            <Skel className="h-3 w-4 shrink-0" />
            <Skel className="h-11 min-w-[9rem] flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function InventoryTransactionTableSkeleton({
  variant = "stock-in-out",
  rows = 8,
}: {
  variant?: TableVariant;
  rows?: number;
}) {
  const headers =
    variant === "wastage" ? WASTAGE_HEADERS : STOCK_IN_OUT_HEADERS;
  const thClass = `${inventoryThClass} bg-[rgba(47,78,64,0.03)]`;
  const tableClass = "w-full table-fixed border-collapse text-left text-sm";

  return (
    <div className={inventoryTableWrapClass}>
      <div className="w-full overflow-x-auto">
        <table className={tableClass}>
          <TableColGroup variant={variant} />
          <thead>
            <tr>
              {headers.map((label) => (
                <th
                  key={label}
                  className={cn(
                    thClass,
                    label === "Actions" && "text-right",
                  )}
                >
                  <Skel className="h-3 w-3/4 max-w-[4.5rem]" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[rgba(47,78,64,0.08)]"
              >
                {headers.map((label, colIndex) => (
                  <td key={label} className="px-5 py-4">
                    {label === "Actions" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Skel className="h-8 w-8" />
                        <Skel className="h-8 w-8" />
                      </div>
                    ) : (
                      <Skel
                        className={cn(
                          "h-4",
                          colIndex === 0 ? "w-[85%]" : "w-[70%]",
                        )}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-[rgba(47,78,64,0.12)] px-5 py-4 sm:flex-row">
        <Skel className="h-4 w-36" />
        <div className="flex items-center gap-1.5">
          <Skel className="h-8 w-8" />
          <Skel className="h-8 w-8" />
          <Skel className="h-8 w-8" />
          <Skel className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
