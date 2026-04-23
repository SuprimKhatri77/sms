export function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#2d4a3e]/08 bg-[#f4f1ec]/50 px-5 py-1">
      <p
        className="mb-0 border-b border-[#2d4a3e]/08 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#e8552a]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}
