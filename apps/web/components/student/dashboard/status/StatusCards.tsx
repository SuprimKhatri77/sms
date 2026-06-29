import Link from "next/link";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { studentStatusBentoClass } from "./student-status-styles";

export interface OptionCard {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  accent?: "green" | "brown";
}

export function OptionCardGrid({ cards }: { cards: OptionCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const accent = card.accent ?? "green";
        const inner = (
          <>
            <div
              className={cn(
                "mb-4 flex h-10 w-10 items-center justify-center",
                accent === "brown"
                  ? "bg-[rgba(194,138,79,0.12)] text-(--brand-brown)"
                  : "bg-[rgba(47,78,64,0.08)] text-(--brand-green)",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-semibold text-(--brand-green) group-hover:text-(--brand-brown)">
              {card.title}
            </p>
            <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.52)]">
              {card.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 font-[family-name:var(--font-dm-sans)] text-[0.78rem] font-semibold text-(--brand-brown) opacity-0 transition-opacity group-hover:opacity-100">
              {card.external ? "Open" : "Go"}
              {card.external ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </span>
          </>
        );

        const className = cn(studentStatusBentoClass, "group flex h-full flex-col");

        if (card.external) {
          return (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          );
        }

        return (
          <Link key={card.title} href={card.href} className={className}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

export function InfoBento({
  items,
}: {
  items: { icon: LucideIcon; label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className={studentStatusBentoClass}>
          <Icon
            className="mb-3 h-4 w-4 text-(--brand-brown)"
            strokeWidth={1.75}
          />
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.4)]">
            {label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.86rem] font-medium leading-snug text-(--brand-green)">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
