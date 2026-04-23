export function StepTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="mb-1 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8552a]/10">
        <Icon className="h-4 w-4 text-[#e8552a]" strokeWidth={1.75} />
      </div>
      <h2
        className="text-[1.15rem] font-semibold text-[#2d4a3e]"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {title}
      </h2>
    </div>
  );
}
