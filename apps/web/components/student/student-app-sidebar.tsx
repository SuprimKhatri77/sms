"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { StudentTeamSwitcher } from "./student-team-switcher";
import { StudentNavUser } from "./student-nav-user";
import { StudentNavRoutes } from "./student-nav-routes";
import Image from "next/image";
import { siteInfo } from "@/utils/site-info";

const data = {
  teams: [
    {
      name: "Brew & Bake Academy",
      logo: (
        <Image
          src={siteInfo.assets.watermarkNoBG}
          alt="Brew & Bake"
          width={24}
          height={24}
        />
      ),
      plan: "Student Dashboard",
    },
  ],
};

export function StudentAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <StudentTeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <StudentNavRoutes />
      </SidebarContent>
      <SidebarFooter>
        <StudentNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
