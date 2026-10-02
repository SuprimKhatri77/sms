import {
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { LEDGER_TYPES, type LedgerSummary } from "@repo/types";
import { formatRs } from "./format";

type Card = {
  key: string;
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone: string;
};

const GREEN = "text-[#16a34a]";
const RED = "text-[#9a3412]";
const BROWN = "text-(--brand-brown)";

// A supplier's balance is what's still owed to them (negative = overpaid);
// cash and bank show money in minus money out.
function balanceCard(row: LedgerSummary, label: string): Card {
  if (row.ledgerType === "supplier") {
    const overpaid = row.balance < 0;
    return {
      key: `${row.ledgerType}-balance`,
      label: overpaid ? `${label} overpaid` : `${label} payable`,
      value: formatRs(Math.abs(row.balance)),
      icon: Wallet,
      tone: overpaid ? RED : BROWN,
    };
  }
  return {
    key: `${row.ledgerType}-balance`,
    label: `${label} balance`,
    value: formatRs(row.balance),
    icon: Wallet,
    tone: row.balance < 0 ? RED : BROWN,
  };
}

function cardsFor(summary: LedgerSummary[]): Card[] {
  // one ledger in view: its credits, debits and balance
  if (summary.length === 1) {
    const row = summary[0]!;
    const isSupplier = row.ledgerType === "supplier";
    return [
      {
        key: "cr",
        label: isSupplier ? "Total purchased (Cr)" : "Total credits",
        value: formatRs(row.totalCr),
        icon: TrendingUp,
        tone: GREEN,
      },
      {
        key: "dr",
        label: isSupplier ? "Total paid (Dr)" : "Total debits",
        value: formatRs(row.totalDr),
        icon: TrendingDown,
        tone: RED,
      },
      { ...balanceCard(row, isSupplier ? "Balance" : "Net"), key: "balance" },
    ];
  }
  // every ledger: one balance card each
  return summary.map((row) => ({
    ...balanceCard(row, LEDGER_TYPES[row.ledgerType].label),
    detail: `Cr ${formatRs(row.totalCr)} · Dr ${formatRs(row.totalDr)}`,
  }));
}

export function LedgerSummaryCards({
  summary,
  loading,
}: {
  summary: LedgerSummary[] | undefined;
  loading: boolean;
}) {
  if (loading || !summary) {
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cardsFor(summary).map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="flex min-w-0 items-start gap-4 border border-[rgba(47,78,64,0.18)] bg-white p-5"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.03)]">
              <Icon size={18} className={card.tone} />
            </div>
            <div className="min-w-0">
              <p className="font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-widest text-[rgba(47,78,64,0.55)]">
                {card.label}
              </p>
              <p
                className={`mt-1 font-(family-name:--font-lora) text-xl font-bold tabular-nums ${card.tone}`}
              >
                {card.value}
              </p>
              {card.detail ? (
                <p className="mt-1 truncate font-(family-name:--font-dm-sans) text-xs tabular-nums text-[rgba(47,78,64,0.5)]">
                  {card.detail}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
