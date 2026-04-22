"use client";

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
            render={<SidebarMenuItem />}
          >
            <CollapsibleTrigger
              render={<SidebarMenuButton tooltip={item.title} />}
            >
              <Link
                href={`/admin${item.url}`}
                className="flex items-center gap-2 font-medium"
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            </CollapsibleTrigger>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
