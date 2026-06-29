import { Skeleton } from "@/components/ui/skeleton";
import { inventoryTableWrapClass } from "../shared/inventory-styles";

export default function ProductsLoading() {
  return (
    <div className={inventoryTableWrapClass}>
      <div className="border-b border-[rgba(47,78,64,0.12)] px-5 py-3.5">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16 bg-[rgba(47,78,64,0.08)]" />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-4 gap-4 border-b border-[rgba(47,78,64,0.06)] px-5 py-4"
        >
          <Skeleton className="h-4 w-3/4 bg-[rgba(47,78,64,0.08)]" />
          <Skeleton className="h-4 w-1/2 bg-[rgba(47,78,64,0.06)]" />
          <Skeleton className="h-4 w-2/3 bg-[rgba(47,78,64,0.06)]" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-8 bg-[rgba(47,78,64,0.08)]" />
            <Skeleton className="h-8 w-8 bg-[rgba(47,78,64,0.08)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
