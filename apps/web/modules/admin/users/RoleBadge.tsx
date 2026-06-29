type UserRole = "student" | "admin" | "instructor";

const roleStyles: Record<UserRole, string> = {
  admin:
    "inline-flex border border-(--brand-green) bg-(--brand-green) px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-white",
  instructor:
    "inline-flex border border-[rgba(194,138,79,0.3)] bg-[rgba(194,138,79,0.1)] px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-(--brand-brown)",
  student:
    "inline-flex border border-[rgba(47,78,64,0.2)] bg-white px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-(--brand-green)",
};

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className={roleStyles[role]}>{role}</span>;
}
