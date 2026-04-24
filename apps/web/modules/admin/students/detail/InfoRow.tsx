export function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <Icon
          className="h-3.5 w-3.5 shrink-0 text-[#2d4a3e]/30"
          strokeWidth={1.75}
        />
        <span
          className="text-[0.88rem] font-medium text-[#2d4a3e]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
