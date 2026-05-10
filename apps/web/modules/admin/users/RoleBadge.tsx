import { UserRole } from "@/utils/mock";

const roleStyles: Record<UserRole, string> = {
  // superadmin:
  //   "bg-(--brand-green) text-white border border-(--brand-green) text-xs font-semibold tracking-widest uppercase px-2 py-0.5",
  admin:
    "bg-(--brand-green-2) text-white border border-(--brand-green-2) text-xs font-semibold tracking-widest uppercase px-2 py-0.5",
  student:
    "bg-white text-(--brand-green) border border-[rgba(47,78,64,0.25)] text-xs font-semibold tracking-widest uppercase px-2 py-0.5",
};

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className={roleStyles[role]}>{role}</span>;
}
