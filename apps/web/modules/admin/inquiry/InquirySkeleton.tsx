"use client";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";

export default function InquirySkeleton() {
  return (
    <AdminPageLayout
      title="Inquiries"
      description="Manage and respond to visitor submissions"
      maxWidth="wide"
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-[rgba(47,78,64,0.12)] border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.08)] lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5">
            <div className="h-3 w-16 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            <div className="mt-3 h-8 w-12 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]"
            style={{ width: `${72 + i * 16}px` }}
          />
        ))}
        <div className="ml-auto h-9 w-48 animate-pulse border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]" />
      </div>

      <div className="mt-6 overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="border-b border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)] px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-20 animate-pulse bg-[rgba(47,78,64,0.08)]"
              />
            ))}
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-4 border-b border-[rgba(47,78,64,0.08)] px-4 py-4 last:border-b-0"
          >
            <div className="h-8 w-8 shrink-0 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-4 flex-1 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-4 w-24 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-6 w-16 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-8 w-16 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          </div>
        ))}
      </div>
    </AdminPageLayout>
  );
}
