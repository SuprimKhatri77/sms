import { UserRole } from "@/utils/mock";

const roleStyles: Record<UserRole, string> = {
  superadmin:
    "bg-black text-white border border-black text-xs font-semibold tracking-widest uppercase px-2 py-0.5",
  admin:
    "bg-zinc-800 text-white border border-zinc-800 text-xs font-semibold tracking-widest uppercase px-2 py-0.5",
  user: "bg-white text-black border border-black text-xs font-semibold tracking-widest uppercase px-2 py-0.5",
};

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className={roleStyles[role]}>{role}</span>;
}
