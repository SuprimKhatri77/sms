export function UsersTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto bg-white p-8 animate-pulse">
      <table className="w-full min-w-130 border-collapse">
        <thead>
          <tr className="bg-(--brand-green) text-white">
            <th className="w-10 border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left">
              <div className="h-3 w-4 rounded-none bg-[rgba(255,255,255,0.35)]" />
            </th>
            <th className="border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left">
              <div className="h-3 w-10 rounded-none bg-[rgba(255,255,255,0.35)]" />
            </th>
            <th className="hidden border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left sm:table-cell">
              <div className="h-3 w-10 rounded-none bg-[rgba(255,255,255,0.35)]" />
            </th>
            <th className="hidden border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left md:table-cell">
              <div className="h-3 w-10 rounded-none bg-[rgba(255,255,255,0.35)]" />
            </th>
            <th className="text-left px-4 py-3">
              <div className="h-3 w-8 rounded-none bg-[rgba(255,255,255,0.35)]" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i} className="border-t border-[rgba(47,78,64,0.12)]">
              <td className="border-r border-[rgba(47,78,64,0.1)] px-4 py-3">
                <div className="h-3 w-4 rounded-none bg-[rgba(47,78,64,0.16)]" />
              </td>
              <td className="border-r border-[rgba(47,78,64,0.1)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-none bg-[rgba(47,78,64,0.16)]" />
                  <div className="h-3 w-28 rounded-none bg-[rgba(47,78,64,0.16)]" />
                </div>
              </td>
              <td className="hidden border-r border-[rgba(47,78,64,0.1)] px-4 py-3 sm:table-cell">
                <div className="h-3 w-40 rounded-none bg-[rgba(47,78,64,0.16)]" />
              </td>
              <td className="hidden border-r border-[rgba(47,78,64,0.1)] px-4 py-3 md:table-cell">
                <div className="h-3 w-24 rounded-none bg-[rgba(47,78,64,0.16)]" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 rounded-none bg-[rgba(47,78,64,0.16)]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
