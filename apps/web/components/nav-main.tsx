"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: { title: string; url: string }[];
  }[];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <DropdownNavItem
              key={item.title}
              item={item}
              isCollapsed={isCollapsed}
            />
          ) : (
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
                  className="flex items-center gap-2 font-medium text-[14px]"
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </CollapsibleTrigger>
            </Collapsible>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function DropdownNavItem({
  item,
  isCollapsed,
}: {
  item: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: { title: string; url: string }[];
  };
  isCollapsed: boolean;
}) {
  const [open, setOpen] = useState(item.isActive ?? false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
        <span className="flex items-center gap-2 font-medium text-[14px] w-full">
          {item.icon}
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </>
          )}
        </span>
      </CollapsibleTrigger>

      {!isCollapsed && (
        <CollapsibleContent>
          <SidebarMenuSub className="ml-6 border-l border-sidebar-border pl-3 mt-1">
            {item.items!.map((sub) => (
              <SidebarMenuSubItem key={sub.title}>
                <Link href={`/admin${sub.url}`} className="text-[13px]">
                  {sub.title}
                </Link>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
