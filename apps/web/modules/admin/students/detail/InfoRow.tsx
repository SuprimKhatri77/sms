import { cn } from "@/lib/utils";
import { detailLabelClass, detailValueClass } from "./detail-styles";

export function InfoRow({
  label,
  value,
  icon: Icon,
  truncate = false,
  className,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  truncate?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className={detailLabelClass}>{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <Icon
          className="h-3.5 w-3.5 shrink-0 text-[rgba(47,78,64,0.35)]"
          strokeWidth={1.75}
        />
        <span
          className={cn(detailValueClass, truncate && "min-w-0 truncate")}
          title={truncate ? value : undefined}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
