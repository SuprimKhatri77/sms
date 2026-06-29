import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { studentDashboardNav } from "./dashboard-nav";
import { dashboardCardClass } from "./dashboard-styles";

export function DashboardQuickLinks() {
  const links = studentDashboardNav.filter((item) => item.href !== "/dashboard");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-[1.05rem] font-semibold text-(--brand-green)">
          Quick links
        </h2>
        <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.84rem] text-[rgba(47,78,64,0.48)]">
          Jump to a section of your portal
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {links.map(({ title, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              dashboardCardClass,
              "group flex items-start justify-between gap-4 p-5 transition-colors duration-200 hover:border-[rgba(47,78,64,0.2)] hover:bg-[#faf9f6]",
            )}
          >
            <div className="min-w-0">
              <div className="mb-3 flex h-9 w-9 items-center justify-center bg-[rgba(47,78,64,0.06)]">
                <Icon
                  className="h-[18px] w-[18px] text-(--brand-green)"
                  strokeWidth={1.75}
                />
              </div>
              <p className="font-[family-name:var(--font-playfair)] text-[0.95rem] font-semibold text-(--brand-green)">
                {title}
              </p>
              <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.78rem] leading-relaxed text-[rgba(47,78,64,0.48)]">
                {description}
              </p>
            </div>
            <ChevronRight
              className="mt-1 h-4 w-4 shrink-0 text-[rgba(47,78,64,0.25)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-(--brand-brown)"
              strokeWidth={2}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
