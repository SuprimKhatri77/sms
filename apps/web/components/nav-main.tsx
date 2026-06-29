"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { isNavItemActive } from "@/lib/admin-nav";

export type NavLink = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  excludeUrls?: string[];
};

export type NavSection = {
  label: string;
  items: NavLink[];
};

export function NavMain({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.label}>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.45)]">
              {section.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isNavItemActive(
                      pathname,
                      item.url,
                      item.excludeUrls ?? [],
                    )}
                    tooltip={item.title}
                    render={
                      <Link
                        href={`/admin${item.url}`}
                        className="flex items-center gap-2.5 font-medium text-[13px]"
                        onClick={closeMobileSidebar}
                      >
                        {item.icon}
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
