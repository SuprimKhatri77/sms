"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Building2,
  CircleHelp,
  Package,
  Settings,
  UserSquare2,
  Users,
  Wallet,
} from "lucide-react";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { useAnalytics } from "@/modules/admin/analytics/hooks/useAnalytics";
import {
  DashboardStats,
  DashboardStatsSkeleton,
} from "@/modules/admin/dashboard/DashboardStats";
import {
  DashboardWorkspace,
  type WorkspaceGroup,
} from "@/modules/admin/dashboard/DashboardWorkspace";

const WORKSPACE_GROUPS: WorkspaceGroup[] = [
  {
    title: "Academic",
    description: "Programs, intake, and curriculum",
    links: [
      {
        title: "Courses",
        description: "Manage programs and pricing",
        href: "/admin/courses",
        icon: BookOpen,
      },
      {
        title: "Inquiries",
        description: "Review leads and follow-ups",
        href: "/admin/inquiries",
        icon: CircleHelp,
      },
    ],
  },
  {
    title: "People",
    description: "Students and admin access",
    links: [
      {
        title: "Students",
        description: "Records, payments, certificates",
        href: "/admin/students",
        icon: UserSquare2,
      },
      {
        title: "Users",
        description: "Admin accounts and roles",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    title: "Operations",
    description: "Stock and school configuration",
    links: [
      {
        title: "Inventory",
        description: "Products, stock, and wastage",
        href: "/admin/inventory/products",
        icon: Package,
      },
      {
        title: "Settings",
        description: "School and system preferences",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Finance",
    description: "Banks, suppliers, and ledgers",
    links: [
      {
        title: "Banks",
        description: "Payment accounts and balances",
        href: "/admin/banks",
        icon: Building2,
      },
      {
        title: "Accounting",
        description: "Ledgers and supplier records",
        href: "/admin/suppliers",
        icon: BookOpenCheck,
      },
      {
        title: "Analytics",
        description: "Revenue and admissions insight",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
];

export function AdminDashboard() {
  const { data, isPending, isError } = useAnalytics();

  const showStats =
    !isPending && !isError && data?.success && data.data.overview;

  const overview = showStats ? data.data.overview : null;
  const hasPriorityItems =
    overview &&
    (overview.pendingApprovals > 0 || overview.studentsWithBalance > 0);

  return (
    <AdminPageLayout
      title="Dashboard"
      description="Operational overview and workspace navigation."
      maxWidth="wide"
      action={
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-2 border border-[rgba(47,78,64,0.2)] bg-white px-4 py-2 font-[family-name:var(--font-dm-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-(--brand-green) transition-colors hover:border-(--brand-green) hover:bg-[rgba(47,78,64,0.03)]"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Full analytics
        </Link>
      }
    >
      <div className="space-y-8">
        {isPending && <DashboardStatsSkeleton />}
        {showStats && (
          <DashboardStats
            overview={data.data.overview}
            revenueStats={data.data.revenueStats}
          />
        )}
        {!isPending && !showStats && (
          <div className="border border-[rgba(47,78,64,0.18)] bg-white px-5 py-4 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
            Metrics are temporarily unavailable. Workspace links below are still
            available.
          </div>
        )}

        {hasPriorityItems && overview && (
          <section className="border border-[rgba(47,78,64,0.18)] bg-white">
            <div className="border-b border-[rgba(47,78,64,0.12)] px-5 py-3">
              <h2 className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(47,78,64,0.45)]">
                Needs attention
              </h2>
            </div>
            <div className="divide-y divide-[rgba(47,78,64,0.08)]">
              {overview.pendingApprovals > 0 && (
                <Link
                  href="/admin/students?status=pending"
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[rgba(47,78,64,0.02)]"
                >
                  <div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
                      {overview.pendingApprovals} student
                      {overview.pendingApprovals === 1 ? "" : "s"} awaiting
                      approval
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                      Review pending enrollments
                    </p>
                  </div>
                  <span className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-brown)">
                    {overview.pendingApprovals}
                  </span>
                </Link>
              )}
              {overview.studentsWithBalance > 0 && (
                <Link
                  href="/admin/students/outstanding"
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[rgba(47,78,64,0.02)]"
                >
                  <div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
                      {overview.studentsWithBalance} outstanding fee
                      {overview.studentsWithBalance === 1 ? "" : "s"}
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                      Follow up on unpaid balances
                    </p>
                  </div>
                  <Wallet className="h-4 w-4 text-[rgba(47,78,64,0.35)]" />
                </Link>
              )}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-green)">
                Workspace
              </h2>
              <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                Browse admin areas by department
              </p>
            </div>
          </div>
          <DashboardWorkspace groups={WORKSPACE_GROUPS} />
        </section>
      </div>
    </AdminPageLayout>
  );
}
