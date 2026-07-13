import { cn } from "@/lib/utils";

type FullWidthDividerProps = {
  position: "top" | "bottom";
  className?: string;
};

export function FullWidthDivider({ position, className }: FullWidthDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "col-span-full h-px bg-border",
        position === "top" && "-order-1",
        className,
      )}
    />
  );
}
