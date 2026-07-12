"use client";

import { User } from "@repo/types";
import { RoleBadge } from "./RoleBadge";
import { UserAvatar } from "./UserAvatar";
import { adminTableClass, adminTableScrollClass } from "@/components/admin/admin-styles";

const thClass =
  "whitespace-nowrap px-4 py-3 text-left font-(family-name:--font-dm-sans) text-[10px] font-bold tracking-widest text-[rgba(47,78,64,0.45)] uppercase";

const tdClass =
  "whitespace-nowrap px-4 py-3 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.65)]";

interface UsersTableProps {
  users: User[];
  // onRowClick?: (user: User) => void;
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className={`${adminTableScrollClass} w-full border border-[rgba(47,78,64,0.18)] bg-white`}>
      <table className={`${adminTableClass} min-w-130`}>
        <thead>
          <tr className="border-b border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]">
            <th className={`${thClass} w-10`}>#</th>
            <th className={thClass}>User</th>
            <th className={`${thClass} hidden sm:table-cell`}>Email</th>
            <th className={`${thClass} hidden md:table-cell`}>Joined</th>
            <th className={thClass}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              className="border-t border-[rgba(47,78,64,0.08)]"
              /*
              onClick={() => onRowClick?.(user)}
              className="group cursor-pointer border-t border-[rgba(47,78,64,0.08)] transition-colors hover:bg-[rgba(47,78,64,0.02)]"
              tabIndex={0}
              role="button"
              aria-label={`Edit ${user.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onRowClick?.(user);
              }}
              */
            >
              <td className={`${tdClass} text-xs text-[rgba(47,78,64,0.45)]`}>
                {idx + 1}
              </td>
              <td className={tdClass}>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user.name}
                    imageUrl={user.imageUrl ?? ""}
                    size="sm"
                  />
                  <span className="font-semibold text-(--brand-green)">
                    {user.name}
                  </span>
                  {/*
                  <span className="font-semibold text-(--brand-green) underline-offset-2 group-hover:underline">
                    {user.name}
                  </span>
                  */}
                </div>
              </td>
              <td className={`${tdClass} hidden sm:table-cell`}>{user.email}</td>
              <td className={`${tdClass} hidden text-xs text-[rgba(47,78,64,0.55)] md:table-cell`}>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className={tdClass}>
                <RoleBadge role={user.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
