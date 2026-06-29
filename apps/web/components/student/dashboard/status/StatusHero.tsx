import { cn } from "@/lib/utils";
import {
  studentStatusBadgeClass,
  studentStatusBodyClass,
  studentStatusEyebrowClass,
  studentStatusTitleClass,
} from "./student-status-styles";

export function StatusHero({
  badge,
  badgeTone = "brown",
  title,
  subtitle,
  children,
  centered = true,
}: {
  badge: React.ReactNode;
  badgeTone?: "brown" | "green" | "muted";
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  centered?: boolean;
}) {
  const badgeToneClass =
    badgeTone === "brown"
      ? "border-[rgba(194,138,79,0.28)] bg-[rgba(194,138,79,0.08)] text-(--brand-brown)"
      : badgeTone === "green"
        ? "border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.06)] text-(--brand-green)"
        : "border-[rgba(47,78,64,0.12)] bg-[#f4f1ec] text-[rgba(47,78,64,0.5)]";

  return (
    <header className={cn("mb-10", centered && "text-center")}>
      <div className={cn("mb-5", centered && "flex justify-center")}>
        <span className={cn(studentStatusBadgeClass, badgeToneClass)}>
          {badge}
        </span>
      </div>
      <h1 className={studentStatusTitleClass}>{title}</h1>
      {subtitle ? (
        <p
          className={cn(
            studentStatusBodyClass,
            "mt-4",
            centered ? "mx-auto max-w-lg" : "max-w-xl",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}

export function StatusEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className={cn(studentStatusEyebrowClass, "mb-3 inline-block")}>
      {children}
    </span>
  );
}
