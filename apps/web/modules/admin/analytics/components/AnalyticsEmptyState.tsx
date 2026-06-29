import type { ElementType } from "react";

export function AnalyticsEmptyState({
  icon: Icon,
  message,
}: {
  icon: ElementType;
  message: string;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-6 text-center sm:min-h-[240px] sm:gap-3 sm:py-8">
      <div className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] text-[rgba(47,78,64,0.35)] sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
      </div>
      <p className="max-w-[16rem] font-[family-name:var(--font-dm-sans)] text-xs leading-relaxed text-[rgba(47,78,64,0.5)] sm:max-w-xs sm:text-sm">
        {message}
      </p>
    </div>
  );
}
