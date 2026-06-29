import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export type WorkspaceLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type WorkspaceGroup = {
  title: string;
  description: string;
  links: WorkspaceLink[];
};

type DashboardWorkspaceProps = {
  groups: WorkspaceGroup[];
};

export function DashboardWorkspace({ groups }: DashboardWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.12)] lg:grid-cols-2">
      {groups.map((group) => (
        <section key={group.title} className="bg-white">
          <div className="border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
            <h3 className="font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
              {group.title}
            </h3>
            <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
              {group.description}
            </p>
          </div>
          <ul>
            {group.links.map((link, index) => (
              <li
                key={link.title}
                className={
                  index < group.links.length - 1
                    ? "border-b border-[rgba(47,78,64,0.08)]"
                    : ""
                }
              >
                <Link
                  href={link.href}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(47,78,64,0.02)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.12)] bg-[rgba(251,250,247,0.8)] text-(--brand-green) transition-colors group-hover:border-(--brand-green) group-hover:text-(--brand-brown)">
                    <link.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
                      {link.title}
                    </span>
                    <span className="mt-0.5 block truncate font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                      {link.description}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[rgba(47,78,64,0.25)] transition-all group-hover:translate-x-0.5 group-hover:text-(--brand-brown)" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
