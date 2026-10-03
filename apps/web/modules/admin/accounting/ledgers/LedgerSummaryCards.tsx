import {
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { LEDGER_TYPES, type LedgerSummary, type LedgerType } from "@repo/types";
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

// what the credits and debits of a party's ledger are, and how its balance
// (credits minus debits) reads when it's owed and when it's paid ahead
const WORDING: Partial<
  Record<
    LedgerType,
    { cr: string; dr: string; owed: string; ahead: string }
  >
> = {
  supplier: {
    cr: "Total purchased (Cr)",
    dr: "Total paid (Dr)",
    owed: "payable",
    ahead: "overpaid",
  },
  salary: {
    cr: "Total due (Cr)",
    dr: "Total paid (Dr)",
    owed: "owed",
    ahead: "paid in advance",
  },
};

// A supplier's or employee's balance is what's still owed to them (negative
// = paid ahead); cash and bank show money in minus money out.
function balanceCard(row: LedgerSummary, label: string): Card {
  const wording = WORDING[row.ledgerType];
  if (wording) {
    const ahead = row.balance < 0;
    return {
      key: `${row.ledgerType}-balance`,
      label: `${label} ${ahead ? wording.ahead : wording.owed}`,
      value: formatRs(Math.abs(row.balance)),
      icon: Wallet,
      tone: ahead ? RED : BROWN,
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
    const wording = WORDING[row.ledgerType];
    return [
      {
        key: "cr",
        label: wording?.cr ?? "Total credits",
        value: formatRs(row.totalCr),
        icon: TrendingUp,
        tone: GREEN,
      },
      {
        key: "dr",
        label: wording?.dr ?? "Total debits",
        value: formatRs(row.totalDr),
        icon: TrendingDown,
        tone: RED,
      },
      { ...balanceCard(row, wording ? "Balance" : "Net"), key: "balance" },
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

  const cards = cardsFor(summary);
  return (
    <div
      className={
        // every ledger: a card each, in two rows of two or one row of four
        cards.length === 4
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          : "grid grid-cols-1 gap-4 sm:grid-cols-3"
      }
    >
      {cards.map((card) => {
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
