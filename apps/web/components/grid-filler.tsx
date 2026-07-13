import { cn } from "@/lib/utils";

type GridFillerProps = {
  totalItems: number;
  smColumns?: number;
  lgColumns?: number;
  className?: string;
};

function getFillerCount(totalItems: number, columns: number) {
  const remainder = totalItems % columns;
  return remainder === 0 ? 0 : columns - remainder;
}

export function GridFiller({
  totalItems,
  smColumns = 2,
  lgColumns = 3,
  className,
}: GridFillerProps) {
  const smFillers = getFillerCount(totalItems, smColumns);
  const lgFillers = getFillerCount(totalItems, lgColumns);

  return (
    <>
      {Array.from({ length: smFillers }).map((_, index) => (
        <div
          key={`sm-filler-${index}`}
          aria-hidden="true"
          className={cn("hidden bg-background sm:block lg:hidden", className)}
        />
      ))}
      {Array.from({ length: lgFillers }).map((_, index) => (
        <div
          key={`lg-filler-${index}`}
          aria-hidden="true"
          className={cn("hidden bg-background lg:block", className)}
        />
      ))}
    </>
  );
}
