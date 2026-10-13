/** Eyebrow + serif title for a section in the course page's main column. */
export function CourseSectionHeading({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className="mb-8 space-y-3 sm:mb-10">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="display text-4xl text-ink sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
