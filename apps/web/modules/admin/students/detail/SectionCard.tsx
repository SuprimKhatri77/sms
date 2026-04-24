export function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#2d4a3e]/50" strokeWidth={1.75} />
        <h2
          className="text-[0.88rem] font-semibold text-[#2d4a3e]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
