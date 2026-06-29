import { Pencil, Trash2 } from "lucide-react";
import { IconBtn } from "./IconButton";
import { StudentDiscountResponse } from "@repo/types";
import { detailInsetClass } from "./detail-styles";
import { formatNpr } from "../shared/student-utils";

type Discount = Extract<
  StudentDiscountResponse,
  { success: true }
>["data"][number];

export function DiscountRow({
  discount,
  onEdit,
  onDelete,
  actionsAllowed = true,
  disabledTooltip,
}: {
  discount: Discount;
  onEdit: (d: Discount) => void;
  onDelete: (id: string) => void;
  actionsAllowed?: boolean;
  disabledTooltip?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 px-4 py-3 ${detailInsetClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="border border-[rgba(194,138,79,0.25)] bg-[rgba(194,138,79,0.08)] px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-(--brand-brown)">
            {discount.type}
          </span>
          <span className="font-[family-name:var(--font-dm-sans)] text-sm font-bold text-(--brand-green)">
            {discount.percent}%
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <IconBtn
            icon={Pencil}
            label="Edit"
            onClick={() => onEdit(discount)}
            disabled={!actionsAllowed}
            disabledTooltip={disabledTooltip}
          />
          <IconBtn
            icon={Trash2}
            label="Delete"
            onClick={() => onDelete(discount.id)}
            variant="danger"
            disabled={!actionsAllowed}
            disabledTooltip={disabledTooltip}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold tabular-nums text-[#9a3412]">
          − {formatNpr(discount.amount / 100)}
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[rgba(47,78,64,0.45)]">
          by {discount.addedByName}
        </span>
      </div>
      {discount.note ? (
        <p className="font-[family-name:var(--font-dm-sans)] text-xs italic text-[rgba(47,78,64,0.5)]">
          {discount.note}
        </p>
      ) : null}
    </div>
  );
}
