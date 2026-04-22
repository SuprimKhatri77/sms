"use client";

import { User } from "@repo/types";
import { RoleBadge } from "./RoleBadge";
import { UserAvatar } from "./UserAvatar";

interface UsersTableProps {
  users: User[];
  onRowClick: (user: User) => void;
}

export function UsersTable({ users, onRowClick }: UsersTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-black">
      <table className="w-full min-w-130 border-collapse">
        <thead>
          <tr className="bg-black text-white">
            <th className="text-left px-4 py-3 font-mono text-xs tracking-widest uppercase font-semibold border-r border-zinc-700 w-10">
              #
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs tracking-widest uppercase font-semibold border-r border-zinc-700">
              User
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs tracking-widest uppercase font-semibold border-r border-zinc-700 hidden sm:table-cell">
              Email
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs tracking-widest uppercase font-semibold hidden md:table-cell border-r border-zinc-700">
              Joined
            </th>
            <th className="text-left px-4 py-3 font-mono text-xs tracking-widest uppercase font-semibold">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              onClick={() => onRowClick(user)}
              className="border-t border-black hover:bg-zinc-50 cursor-pointer transition-colors group"
              tabIndex={0}
              role="button"
              aria-label={`Edit ${user.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onRowClick(user);
              }}
            >
              <td className="px-4 py-3 font-mono text-xs text-zinc-400 border-r border-zinc-200">
                {idx + 1}
              </td>
              <td className="px-4 py-3 border-r border-zinc-200">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user.name}
                    imageUrl={user.imageUrl ?? ""}
                    size="sm"
                  />
                  <span className="font-mono text-sm font-medium text-black group-hover:underline underline-offset-2">
                    {user.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-sm text-zinc-600 border-r border-zinc-200 hidden sm:table-cell">
                {user.email}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500 hidden md:table-cell border-r border-zinc-200">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <RoleBadge role={user.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
