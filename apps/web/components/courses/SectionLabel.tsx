import { courseEyebrowClass } from "./course-styles";
import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(`${courseEyebrowClass} mb-3`, className)}>{children}</p>
  );
}
