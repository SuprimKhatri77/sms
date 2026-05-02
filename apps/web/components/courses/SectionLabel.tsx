export function SectionLabel({
  children,
  centered,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <p
      className={`mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.18em] ${centered ? "text-center" : ""}`}
      style={{ color: "var(--brand-green, #2f4e40)" }}
    >
      {children}
    </p>
  );
}
