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
    <div className="w-full overflow-x-auto border border-[rgba(47,78,64,0.18)] bg-white">
      <table className="w-full min-w-130 border-collapse">
        <thead>
          <tr className="bg-(--brand-green) text-white">
            <th className="w-10 border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left font-mono text-xs font-semibold tracking-widest uppercase">
              #
            </th>
            <th className="border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left font-mono text-xs font-semibold tracking-widest uppercase">
              User
            </th>
            <th className="hidden border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left font-mono text-xs font-semibold tracking-widest uppercase sm:table-cell">
              Email
            </th>
            <th className="hidden border-r border-[rgba(255,255,255,0.2)] px-4 py-3 text-left font-mono text-xs font-semibold tracking-widest uppercase md:table-cell">
              Joined
            </th>
            <th className="px-4 py-3 text-left font-mono text-xs font-semibold tracking-widest uppercase">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              onClick={() => onRowClick(user)}
              className="group cursor-pointer border-t border-[rgba(47,78,64,0.1)] transition-colors hover:bg-[rgba(47,78,64,0.04)]"
              tabIndex={0}
              role="button"
              aria-label={`Edit ${user.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onRowClick(user);
              }}
            >
              <td className="border-r border-[rgba(47,78,64,0.1)] px-4 py-3 font-mono text-xs text-[rgba(47,78,64,0.45)]">
                {idx + 1}
              </td>
              <td className="border-r border-[rgba(47,78,64,0.1)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user.name}
                    imageUrl={user.imageUrl ?? ""}
                    size="sm"
                  />
                  <span className="font-mono text-sm font-medium text-(--brand-green) underline-offset-2 group-hover:underline">
                    {user.name}
                  </span>
                </div>
              </td>
              <td className="hidden border-r border-[rgba(47,78,64,0.1)] px-4 py-3 font-mono text-sm text-[rgba(47,78,64,0.65)] sm:table-cell">
                {user.email}
              </td>
              <td className="hidden border-r border-[rgba(47,78,64,0.1)] px-4 py-3 font-mono text-xs text-[rgba(47,78,64,0.55)] md:table-cell">
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
