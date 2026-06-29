import { AdminPageLayout } from "@/components/admin/admin-page-layout";

const SKELETON_ROWS = 4;

export function SettingsLoading() {
  return (
    <AdminPageLayout
      title="Site Settings"
      description="Manage global configuration values"
    >
      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="border-b border-[rgba(47,78,64,0.12)] px-5 py-3">
          <div className="h-3 w-16 animate-pulse bg-[rgba(47,78,64,0.08)]" />
        </div>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-[rgba(47,78,64,0.08)] px-5 py-4 last:border-b-0"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse bg-[rgba(47,78,64,0.08)]" />
              <div className="h-3 w-20 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 animate-pulse bg-[rgba(47,78,64,0.08)]" />
              <div className="h-8 w-8 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            </div>
          </div>
        ))}
      </div>
    </AdminPageLayout>
  );
}
