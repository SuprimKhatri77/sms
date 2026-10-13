import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** A mono-caps label over an underline input, with an optional hint. */
export function AuthField({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & ComponentProps<"input">) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="block font-label text-[0.6875rem] tracking-[0.16em] text-ink uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-none border-0 border-b bg-transparent px-0 py-2.5 text-[0.9375rem] text-ink transition-[border-color] duration-300 outline-none placeholder:text-ink-muted/60",
          error
            ? "border-red-600 focus:border-red-700"
            : "border-ink/20 hover:border-ink/40 focus:border-ink",
        )}
        {...props}
      />
      {error ? (
        // key: a new message replays the entrance.
        <p
          key={error}
          id={`${id}-error`}
          role="alert"
          className="animate-rise text-[0.75rem] text-red-700"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.75rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
