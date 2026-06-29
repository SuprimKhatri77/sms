"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { STUDENT_STATUS_ACTION_TOOLTIP } from "./student-status-actions";

export function StatusActionTooltip({
  blocked,
  children,
  message = STUDENT_STATUS_ACTION_TOOLTIP,
  className,
}: {
  blocked: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
}) {
  if (!blocked) return children;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex w-fit min-w-0 [&_button]:pointer-events-none",
              className,
            )}
          >
            {children}
          </span>
        }
      />
      <TooltipContent side="top" className="max-w-[220px] text-center">
        {message}
      </TooltipContent>
    </Tooltip>
  );
}
