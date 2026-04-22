export function UsersTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto border border-black animate-pulse">
      <table className="w-full min-w-[520px] border-collapse">
        <thead>
          <tr className="bg-black text-white">
            <th className="text-left px-4 py-3 border-r border-zinc-700 w-10">
              <div className="h-3 w-4 bg-zinc-700 rounded-none" />
            </th>
            <th className="text-left px-4 py-3 border-r border-zinc-700">
              <div className="h-3 w-10 bg-zinc-700 rounded-none" />
            </th>
            <th className="text-left px-4 py-3 border-r border-zinc-700 hidden sm:table-cell">
              <div className="h-3 w-10 bg-zinc-700 rounded-none" />
            </th>
            <th className="text-left px-4 py-3 border-r border-zinc-700 hidden md:table-cell">
              <div className="h-3 w-10 bg-zinc-700 rounded-none" />
            </th>
            <th className="text-left px-4 py-3">
              <div className="h-3 w-8 bg-zinc-700 rounded-none" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i} className="border-t border-black">
              <td className="px-4 py-3 border-r border-zinc-200">
                <div className="h-3 w-4 bg-zinc-200 rounded-none" />
              </td>
              <td className="px-4 py-3 border-r border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-200 flex-shrink-0 rounded-none" />
                  <div className="h-3 w-28 bg-zinc-200 rounded-none" />
                </div>
              </td>
              <td className="px-4 py-3 border-r border-zinc-200 hidden sm:table-cell">
                <div className="h-3 w-40 bg-zinc-200 rounded-none" />
              </td>
              <td className="px-4 py-3 border-r border-zinc-200 hidden md:table-cell">
                <div className="h-3 w-24 bg-zinc-200 rounded-none" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 bg-zinc-200 rounded-none" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
