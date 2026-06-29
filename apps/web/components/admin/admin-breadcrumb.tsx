"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  admin: "Admin",
  analytics: "Analytics",
  settings: "Settings",
  profile: "Profile",
  users: "Users",
  students: "Students",
  outstanding: "Outstanding",
  sales: "Sales Revenue",
  inquiries: "Inquiries",
  courses: "Courses",
  inventory: "Inventory",
  products: "Products",
  "stock-in": "Stock In",
  "stock-out": "Stock Out",
  wastage: "Wastage",
  summary: "Summary",
  banks: "Banks",
  ledger: "Ledger",
  suppliers: "Suppliers",
  "cash-ledger": "Cash Ledger",
  "certificate-preview": "Certificate Preview",
  certificate: "Certificate",
};

function segmentLabel(segment: string) {
  if (LABELS[segment]) return LABELS[segment];
  // Hide UUID-like segments in breadcrumbs
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment,
    )
  ) {
    return "Details";
  }
  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = segmentLabel(segment);

          return (
            <div key={href} className="contents">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <Link href={href}>{label}</Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
