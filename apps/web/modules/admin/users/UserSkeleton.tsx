import { UsersTableSkeleton } from "./UserTableSkeleton";

export function UsersPageSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="h-7 w-32 bg-zinc-200 rounded-none mb-2" />
          <div className="h-3 w-48 bg-zinc-100 rounded-none" />
        </div>
        <div className="h-10 w-36 bg-zinc-200 rounded-none" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-black mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-5 py-4 border-r border-black last:border-r-0"
          >
            <div className="h-3 w-16 bg-zinc-200 rounded-none mb-2" />
            <div className="h-7 w-10 bg-zinc-100 rounded-none" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <UsersTableSkeleton />

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-6">
        <div className="h-3 w-32 bg-zinc-200 rounded-none" />
        <div className="h-10 w-36 bg-zinc-200 rounded-none" />
      </div>
    </div>
  );
}
