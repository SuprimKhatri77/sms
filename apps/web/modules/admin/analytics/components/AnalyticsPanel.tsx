import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnalyticsPanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  embedded?: boolean;
  className?: string;
};

export function AnalyticsPanel({
  title,
  description,
  action,
  children,
  embedded = false,
  className,
}: AnalyticsPanelProps) {
  return (
    <section
      className={cn(
        "bg-white",
        !embedded && "border border-[rgba(47,78,64,0.18)]",
        className,
      )}
    >
      <div className="flex flex-col gap-2 border-b border-[rgba(47,78,64,0.12)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

type AnalyticsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AnalyticsSection({
  title,
  description,
  children,
}: AnalyticsSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-green)">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function AnalyticsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.12)] lg:grid-cols-2">
      {children}
    </div>
  );
}
