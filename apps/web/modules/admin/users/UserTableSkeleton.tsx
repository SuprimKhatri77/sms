export function UsersTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto border border-[rgba(47,78,64,0.18)] bg-white">
      <table className="w-full min-w-130 border-collapse">
        <thead>
          <tr className="border-b border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-3 w-12 animate-pulse bg-[rgba(47,78,64,0.08)]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-t border-[rgba(47,78,64,0.08)]">
              <td className="px-4 py-3">
                <div className="h-3 w-4 animate-pulse bg-[rgba(47,78,64,0.06)]" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 animate-pulse bg-[rgba(47,78,64,0.06)]" />
                  <div className="h-3 w-28 animate-pulse bg-[rgba(47,78,64,0.06)]" />
                </div>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <div className="h-3 w-40 animate-pulse bg-[rgba(47,78,64,0.06)]" />
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <div className="h-3 w-24 animate-pulse bg-[rgba(47,78,64,0.06)]" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 animate-pulse bg-[rgba(47,78,64,0.06)]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
