import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { cn } from "@/lib/utils";
import {
  InventoryTransactionFiltersSkeleton,
  InventoryTransactionTableSkeleton,
} from "./InventoryTransactionTableSkeleton";

function Skel({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)}
      aria-hidden
    />
  );
}

type PageSkeletonProps = {
  title: string;
  description: string;
  actionWidth?: string;
  variant?: "stock-in-out" | "wastage";
};

export function InventoryTransactionPageSkeleton({
  title,
  description,
  actionWidth = "w-32",
  variant = "stock-in-out",
}: PageSkeletonProps) {
  return (
    <AdminPageLayout
      title={title}
      description={description}
      maxWidth="wide"
      action={<Skel className={cn("h-10", actionWidth)} />}
    >
      <div className="space-y-6">
        <InventoryTransactionFiltersSkeleton />
        <InventoryTransactionTableSkeleton variant={variant} />
      </div>
    </AdminPageLayout>
  );
}
