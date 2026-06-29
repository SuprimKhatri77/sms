import { dashboardPageClass } from "./dashboard-styles";
import { siteInfo } from "@/utils/site-info";
import { cn } from "@/lib/utils";

export function DashboardPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--brand-cream) font-[family-name:var(--font-dm-sans)]">
      <div
        className={cn(
          dashboardPageClass,
          "px-4 py-8 sm:px-6 sm:py-10 lg:py-12",
        )}
      >
        <header className="mb-10 border-b border-[rgba(47,78,64,0.08)] pb-6">
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.16em] text-(--brand-brown)">
            Student portal
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,3vw,1.85rem)] font-bold text-(--brand-green)">
            {title}
          </h1>
          <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.88rem] text-[rgba(47,78,64,0.5)]">
            {description ?? siteInfo.company.shortName}
          </p>
        </header>

        {children}

        <footer className="mt-14 border-t border-[rgba(47,78,64,0.08)] pt-6 text-center">
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.75rem] text-[rgba(47,78,64,0.38)]">
            {siteInfo.company.name} · PAN {siteInfo.company.panNo}
          </p>
        </footer>
      </div>
    </div>
  );
}
