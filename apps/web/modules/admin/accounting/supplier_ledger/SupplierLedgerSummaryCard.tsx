import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatRs } from "../bank-ledger/format";
import { SupplierLedgerSummary } from "@repo/types";

interface SupplierLedgerSummaryCardsProps {
  summary: SupplierLedgerSummary | null;
  loading?: boolean;
}

export function SupplierLedgerSummaryCards({
  summary,
  loading = false,
}: SupplierLedgerSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse border border-[rgba(47,78,64,0.18)] bg-white p-5"
          >
            <div className="mb-3 h-3 w-24 bg-[rgba(47,78,64,0.08)]" />
            <div className="h-7 w-36 bg-[rgba(47,78,64,0.08)]" />
          </div>
        ))}
      </div>
    );
  }

  const balance = summary?.outstanding ?? 0;
  const isOverpaid = balance < 0;

  const cards = [
    {
      label: "Total Purchased (Cr)",
      value: summary ? formatRs(summary.totalCr) : "Rs. 0.00",
      icon: TrendingUp,
      valueClass: "text-[#16a34a]",
      iconClass: "text-[#16a34a]",
    },
    {
      label: "Total Paid (Dr)",
      value: summary ? formatRs(summary.totalDr) : "Rs. 0.00",
      icon: TrendingDown,
      valueClass: "text-[#9a3412]",
      iconClass: "text-[#9a3412]",
    },
    {
      label: isOverpaid ? "Overpaid" : "Payable Balance",
      value: summary ? formatRs(Math.abs(balance)) : "Rs. 0.00",
      icon: Wallet,
      valueClass: isOverpaid ? "text-[#9a3412]" : "text-(--brand-brown)",
      iconClass: isOverpaid ? "text-[#9a3412]" : "text-(--brand-brown)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-start gap-4 border border-[rgba(47,78,64,0.18)] bg-white p-5"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.03)]">
              <Icon size={18} className={card.iconClass} />
            </div>
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.55)]">
                {card.label}
              </p>
              <p
                className={`mt-1 font-[family-name:var(--font-lora)] text-xl font-bold tabular-nums ${card.valueClass}`}
              >
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
