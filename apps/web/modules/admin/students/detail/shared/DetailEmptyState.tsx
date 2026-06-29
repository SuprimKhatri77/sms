import type { ElementType, ReactNode } from "react";
import {
  detailEmptyIconClass,
  detailEmptyIconWrapClass,
  detailEmptyMessageClass,
  detailEmptyWrapClass,
} from "../detail-styles";

export function DetailEmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: ElementType;
  message: string;
  action: ReactNode;
}) {
  return (
    <div className={detailEmptyWrapClass}>
      <div className={detailEmptyIconWrapClass}>
        <Icon className={detailEmptyIconClass} strokeWidth={1.5} />
      </div>
      <p className={detailEmptyMessageClass}>{message}</p>
      <div className="flex w-full justify-center">{action}</div>
    </div>
  );
}
