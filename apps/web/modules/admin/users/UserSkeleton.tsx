import { UsersTableSkeleton } from "./UserTableSkeleton";

export function UsersPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="mb-2 h-7 w-32 rounded-none bg-[rgba(47,78,64,0.18)]" />
          <div className="h-3 w-48 rounded-none bg-[rgba(47,78,64,0.1)]" />
        </div>
        <div className="h-10 w-36 rounded-none bg-[rgba(194,138,79,0.2)]" />
      </div>

      {/* Stats row skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-0 border border-[rgba(47,78,64,0.2)] bg-white sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-r border-[rgba(47,78,64,0.14)] px-5 py-4 last:border-r-0"
          >
            <div className="mb-2 h-3 w-16 rounded-none bg-[rgba(47,78,64,0.16)]" />
            <div className="h-7 w-10 rounded-none bg-[rgba(47,78,64,0.1)]" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <UsersTableSkeleton />

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-6">
        <div className="h-3 w-32 rounded-none bg-[rgba(47,78,64,0.16)]" />
        <div className="h-10 w-36 rounded-none bg-[rgba(47,78,64,0.16)]" />
      </div>
    </div>
  );
}
