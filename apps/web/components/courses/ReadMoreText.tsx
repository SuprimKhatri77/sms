"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function ReadMoreText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();

  return (
    <div className="max-w-xl">
      <p
        id={id}
        className={cn(
          "text-[0.9375rem] leading-relaxed text-ink-muted",
          !expanded && "line-clamp-3",
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={id}
        className="link-underline mt-2 text-[0.8125rem] text-ink outline-none"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
