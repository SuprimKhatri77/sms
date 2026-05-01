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
    <div className="mb-8 grid grid-cols-2 gap-0 border border-[rgba(47,78,64,0.18)] bg-white sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-5 py-4 ${i < stats.length - 1 ? "border-r border-[rgba(47,78,64,0.15)]" : ""}`}
        >
          <p className="mb-1 font-mono text-xs tracking-widest text-[rgba(47,78,64,0.55)] uppercase">
            {stat.label}
          </p>
          <p className="font-mono text-2xl font-bold text-(--brand-green)">
            {stat.count}
          </p>
        </div>
      ))}
    </div>
  );
}
