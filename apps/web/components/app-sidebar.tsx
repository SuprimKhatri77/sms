"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { RowsIcon, StudentIcon } from "@phosphor-icons/react";
import { Book, Settings, TrendingUp, User } from "lucide-react";

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: <RowsIcon />,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Analytics",
      url: "/analytics",
      icon: <TrendingUp />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings />,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: <Book />,
    },
    {
      title: "Users",
      url: "/users",
      icon: <User />,
    },
    {
      title: "Students",
      url: "/students",
      icon: <StudentIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
