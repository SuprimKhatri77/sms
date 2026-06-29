import { getInitials } from "./student-utils";

export function StudentInitialsAvatar({ name }: { name: string }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center bg-(--brand-green) font-[family-name:var(--font-dm-sans)] text-[13px] font-bold tracking-[0.04em] text-(--brand-brown)">
      {getInitials(name)}
    </div>
  );
}
