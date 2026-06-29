import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { cn } from "@/lib/utils";

function Skel({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)}
      aria-hidden
    />
  );
}

function SectionHeaderSkel({ actionWidth = "w-28" }: { actionWidth?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[rgba(47,78,64,0.1)] bg-[rgba(47,78,64,0.03)] px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        <Skel className="mt-0.5 h-9 w-9 shrink-0" />
        <div className="space-y-2">
          <Skel className="h-5 w-36" />
          <Skel className="h-4 w-full max-w-md" />
          <Skel className="h-4 w-56 max-w-full" />
        </div>
      </div>
      <Skel className={cn("h-10 shrink-0", actionWidth)} />
    </div>
  );
}

function FieldSkel({ labelWidth = "w-24" }: { labelWidth?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Skel className={cn("h-3", labelWidth)} />
      <Skel className="h-11 w-full" />
    </div>
  );
}

function PasswordGuidanceSkel() {
  return (
    <aside className="border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] p-5 lg:sticky lg:top-24">
      <Skel className="h-3 w-28" />
      <Skel className="mt-3 h-5 w-52" />
      <div className="mt-3 space-y-2">
        <Skel className="h-4 w-full" />
        <Skel className="h-4 w-full" />
        <Skel className="h-4 w-[80%]" />
      </div>
      <ul className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <Skel className="h-4 w-4 shrink-0" />
            <Skel
              className={cn(
                "h-4",
                i % 2 === 0 ? "w-44" : "w-36",
              )}
            />
          </li>
        ))}
      </ul>
      <Skel className="mt-5 h-10 w-full border-t border-transparent pt-4" />
    </aside>
  );
}

export function AdminProfileSkeleton() {
  return (
    <AdminPageLayout
      title="Profile"
      description="Manage how you appear in the admin panel and keep your account secure."
      maxWidth="default"
    >
      <div className="space-y-8">
        <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
          <SectionHeaderSkel actionWidth="w-32" />

          <div className="grid gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[auto_1fr] lg:items-start">
            <div className="flex flex-col items-center gap-4 sm:items-start">
              <div className="relative">
                <Skel className="h-24 w-24" />
                <Skel className="absolute -right-1 -bottom-1 h-8 w-8 border-2 border-white" />
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Skel className="h-10 w-28" />
                <Skel className="h-10 w-24" />
              </div>
            </div>

            <div className="max-w-md">
              <FieldSkel labelWidth="w-28" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
          <SectionHeaderSkel actionWidth="w-36" />

          <div className="grid gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
            <div className="flex flex-col gap-6">
              <FieldSkel labelWidth="w-32" />
              <FieldSkel labelWidth="w-28" />
              <FieldSkel labelWidth="w-40" />
            </div>

            <PasswordGuidanceSkel />
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
