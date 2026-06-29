import { AdminPageLayout } from "@/components/admin/admin-page-layout";

const SKELETON_ROWS = 5;

export function CoursesLoading() {
  return (
    <AdminPageLayout
      title="Courses"
      description="Manage available courses and their fees"
      maxWidth="wide"
    >
      <div className="mb-6 grid grid-cols-1 divide-y divide-[rgba(47,78,64,0.12)] border border-[rgba(47,78,64,0.18)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-5">
            <div className="h-8 w-12 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            <div className="mt-2 h-3 w-16 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          </div>
        ))}
      </div>

      <div className="mb-4 h-10 w-full max-w-md animate-pulse border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]" />

      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="border-b border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)] px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-20 animate-pulse bg-[rgba(47,78,64,0.08)]"
              />
            ))}
          </div>
        </div>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[rgba(47,78,64,0.08)] px-4 py-4 last:border-b-0"
            style={{ opacity: 1 - i * 0.12 }}
          >
            <div className="h-4 flex-[3] animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-4 flex-[1.5] animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-6 w-10 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-4 flex-1 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="flex gap-2">
              <div className="h-8 w-8 animate-pulse bg-[rgba(47,78,64,0.06)]" />
              <div className="h-8 w-8 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            </div>
          </div>
        ))}
      </div>
    </AdminPageLayout>
  );
}
