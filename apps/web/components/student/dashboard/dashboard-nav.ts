import {
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type StudentDashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const studentDashboardNav: StudentDashboardNavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your profile and portal home",
  },
  {
    title: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
    description: "Programs you are enrolled in",
  },
  {
    title: "Finances",
    href: "/dashboard/finances",
    icon: Wallet,
    description: "Fees, payments, discounts, and scholarship",
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: CircleHelp,
    description: "Contact and office information",
  },
];
