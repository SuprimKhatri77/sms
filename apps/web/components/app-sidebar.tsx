"use client";

import * as React from "react";
import Image from "next/image";

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
import { QuestionIcon, StudentIcon } from "@phosphor-icons/react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Book,
  BookOpenCheck,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Trash2,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { siteInfo } from "@/utils/site-info";

const navSections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: <LayoutDashboard /> },
      { title: "Analytics", url: "/analytics", icon: <TrendingUp /> },
    ],
  },
  {
    label: "School",
    items: [
      { title: "Courses", url: "/courses", icon: <Book /> },
      { title: "Inquiries", url: "/inquiries", icon: <QuestionIcon /> },
      { title: "Users", url: "/users", icon: <User /> },
      { title: "Settings", url: "/settings", icon: <Settings /> },
    ],
  },
  {
    label: "Students",
    items: [
      {
        title: "All Students",
        url: "/students",
        icon: <StudentIcon />,
        excludeUrls: ["/students/outstanding", "/students/sales"],
      },
      {
        title: "Outstanding",
        url: "/students/outstanding",
        icon: <Receipt />,
      },
      {
        title: "Sales Revenue",
        url: "/students/sales",
        icon: <BarChart3 />,
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Products", url: "/inventory/products", icon: <Package /> },
      { title: "Stock In", url: "/inventory/stock-in", icon: <ArrowDownToLine /> },
      { title: "Stock Out", url: "/inventory/stock-out", icon: <ArrowUpFromLine /> },
      { title: "Wastage", url: "/inventory/wastage", icon: <Trash2 /> },
      { title: "Summary", url: "/inventory/summary", icon: <ClipboardList /> },
    ],
  },
  {
    label: "Accounting",
    items: [
      {
        title: "Banks",
        url: "/banks",
        icon: <Building2 />,
        excludeUrls: ["/banks/ledger"],
      },
      {
        title: "Suppliers",
        url: "/suppliers",
        icon: <BookOpenCheck />,
        excludeUrls: ["/suppliers/ledger"],
      },
      { title: "Bank Ledger", url: "/banks/ledger", icon: <Wallet /> },
      { title: "Cash Ledger", url: "/cash-ledger", icon: <Wallet /> },
      {
        title: "Supplier Ledger",
        url: "/suppliers/ledger",
        icon: <Wallet />,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain sections={navSections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

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
      plan: "Admin Panel",
    },
  ],
};
