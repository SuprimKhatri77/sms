interface StatsBarProps {
  total: number;
  roleCount: {
    student: number;
    admin: number;
    instructor: number;
  };
}

export function StatsBar({ total, roleCount }: StatsBarProps) {
  const stats = [
    { label: "Total", count: total },
    { label: "Students", count: roleCount.student },
    { label: "Admins", count: roleCount.admin },
    { label: "Instructors", count: roleCount.instructor },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 divide-x divide-y divide-[rgba(47,78,64,0.12)] border border-[rgba(47,78,64,0.18)] sm:grid-cols-4 sm:divide-y-0">
      {stats.map(({ label, count }) => (
        <div key={label} className="bg-white px-5 py-4">
          <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
            {label}
          </p>
          <p className="mt-2 font-[family-name:var(--font-lora)] text-2xl font-bold text-(--brand-green)">
            {count}
          </p>
        </div>
      ))}
    </div>
  );
}
