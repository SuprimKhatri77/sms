import { formatNpr } from "./student-utils";

type StudentFinanceSummaryProps = {
  primaryLabel: string;
  primaryValue: string;
  primaryHint: string;
  secondaryLabel: string;
  secondaryValue: string;
  secondaryHint: string;
  isLoading?: boolean;
};

export function StudentFinanceSummary({
  primaryLabel,
  primaryValue,
  primaryHint,
  secondaryLabel,
  secondaryValue,
  secondaryHint,
  isLoading,
}: StudentFinanceSummaryProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.18)] sm:grid-cols-2">
      <div className="relative overflow-hidden bg-(--brand-green) px-6 py-5">
        <div className="absolute inset-y-0 right-0 w-24 bg-[rgba(194,138,79,0.12)]" />
        <p className="relative font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">
          {primaryLabel}
        </p>
        {isLoading ? (
          <div className="relative mt-3 h-9 w-44 animate-pulse bg-white/15" />
        ) : (
          <p className="relative mt-2 font-[family-name:var(--font-lora)] text-3xl font-bold tracking-tight text-(--brand-brown)">
            {primaryValue}
          </p>
        )}
        <p className="relative mt-1 font-[family-name:var(--font-dm-sans)] text-xs text-white/55">
          {primaryHint}
        </p>
      </div>

      <div className="bg-white px-6 py-5">
        <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
          {secondaryLabel}
        </p>
        {isLoading ? (
          <div className="mt-3 h-10 w-20 animate-pulse bg-[rgba(47,78,64,0.08)]" />
        ) : (
          <p className="mt-2 font-[family-name:var(--font-lora)] text-4xl font-bold tracking-tight text-(--brand-green)">
            {secondaryValue}
          </p>
        )}
        <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
          {secondaryHint}
        </p>
      </div>
    </div>
  );
}

export function formatSummaryNpr(paisa: number): string {
  return formatNpr(paisa / 100);
}
