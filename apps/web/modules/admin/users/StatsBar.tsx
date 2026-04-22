import { UserRole } from "@/utils/mock";
import { User } from "@repo/types";

interface StatsBarProps {
  users: User[];
}

interface StatItem {
  label: string;
  count: number;
}

export function StatsBar({ users }: StatsBarProps) {
  function countByRole(role: UserRole): number {
    return users.filter((u) => u.role === role).length;
  }

  const stats: StatItem[] = [
    { label: "Total", count: users.length },
    { label: "Users", count: countByRole("user") },
    { label: "Admins", count: countByRole("admin") },
    { label: "Superadmins", count: countByRole("superadmin") },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-black mb-8">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-5 py-4 ${i < stats.length - 1 ? "border-r border-black" : ""}`}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-zinc-500 mb-1">
            {stat.label}
          </p>
          <p className="font-mono text-2xl font-bold text-black">
            {stat.count}
          </p>
        </div>
      ))}
    </div>
  );
}
