export const dynamic = "force-dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import { OutstandingStudentsView } from "@/modules/admin/students/outstanding/OutstandingStudentsView";

export const metadata: Metadata = {
  title: "Outstanding Fees | Admin",
  description: "Students with pending fee balances",
};

export default function OutstandingStudentsPage() {
  return (
    <Suspense fallback={<OutstandingPageFallback />}>
      <OutstandingStudentsView />
    </Suspense>
  );
}

function OutstandingPageFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-8xl space-y-6">
        <div className="space-y-2 border-b border-[rgba(47,78,64,0.12)] pb-6">
          <div className="h-3 w-16 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="h-8 w-64 animate-pulse bg-[rgba(47,78,64,0.1)]" />
          <div className="h-4 w-80 animate-pulse bg-[rgba(47,78,64,0.06)]" />
        </div>
        <div className="grid grid-cols-1 gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.18)] sm:grid-cols-2">
          <div className="h-28 animate-pulse bg-(--brand-green)" />
          <div className="h-28 animate-pulse bg-white" />
        </div>
        <div className="h-24 animate-pulse border border-[rgba(47,78,64,0.18)] bg-white" />
        <div className="h-96 animate-pulse border border-[rgba(47,78,64,0.18)] bg-white" />
      </div>
    </div>
  );
}
