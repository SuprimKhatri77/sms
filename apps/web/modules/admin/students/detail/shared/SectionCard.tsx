import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { detailPanelClass } from "../detail-styles";

export function SectionCard({
  title,
  icon: Icon,
  children,
  action,
  className,
  contentClassName,
  headerClassName,
  titleClassName,
  actionClassName,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  actionClassName?: string;
}) {
  return (
    <section className={cn(detailPanelClass, className)}>
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b border-[rgba(47,78,64,0.12)] px-4 py-3 sm:gap-3 sm:px-5 sm:py-4",
          headerClassName,
        )}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] text-(--brand-green) sm:h-8 sm:w-8">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
          </div>
          <h3
            className={cn(
              "font-[family-name:var(--font-lora)] text-xs font-bold text-(--brand-green) sm:text-sm",
              titleClassName,
            )}
          >
            {title}
          </h3>
        </div>
        {action ? (
          <div className={cn("shrink-0", actionClassName)}>{action}</div>
        ) : null}
      </div>
      <div className={cn("px-5 py-4", contentClassName)}>{children}</div>
    </section>
  );
}
