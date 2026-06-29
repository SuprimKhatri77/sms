import { formatNpr, getPaymentProgressPct } from "../shared/student-utils";
import { detailLabelClass } from "./detail-styles";
import { cn } from "@/lib/utils";

type StudentFinanceBarProps = {
  totalFee: number;
  totalPaid: number;
  discountAmount: number;
  scholarshipAmount: number;
  balanceDue: number;
  courseCount: number;
  paymentCount: number;
};

export function StudentFinanceBar({
  totalFee,
  totalPaid,
  discountAmount,
  scholarshipAmount,
  balanceDue,
  courseCount,
  paymentCount,
}: StudentFinanceBarProps) {
  const adjustments = discountAmount + scholarshipAmount;
  const progressPct = getPaymentProgressPct({
    totalCourseFee: totalFee * 100,
    totalPaid: totalPaid * 100,
    totalDiscount: discountAmount * 100,
    totalScholarship: scholarshipAmount * 100,
  });

  const stats = [
    {
      label: "Total Fee",
      value: formatNpr(totalFee),
      hint: `${courseCount} course${courseCount !== 1 ? "s" : ""}`,
    },
    {
      label: "Total Paid",
      value: formatNpr(totalPaid),
      hint: `${paymentCount} payment${paymentCount !== 1 ? "s" : ""}`,
    },
    {
      label: "Adjustments",
      value: formatNpr(adjustments),
      hint: "Discounts + scholarship",
    },
    {
      label: "Balance Due",
      value: formatNpr(Math.abs(balanceDue)),
      hint:
        balanceDue > 0 ? "Outstanding" : balanceDue === 0 ? "Cleared" : "Overpaid",
      accent: balanceDue > 0,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.18)] lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white px-5 py-4">
            <p className={detailLabelClass}>{stat.label}</p>
            <p
              className={cn(
                "mt-2 font-[family-name:var(--font-lora)] text-xl font-bold tracking-tight",
                stat.accent ? "text-[#9a3412]" : "text-(--brand-green)",
              )}
            >
              {stat.value}
            </p>
            <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
              {stat.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-[rgba(47,78,64,0.18)] bg-white px-5 py-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className={detailLabelClass}>Payment Progress</p>
          <p className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold tabular-nums text-(--brand-green)">
            {Math.round(progressPct)}% collected
          </p>
        </div>
        <div className="h-2 overflow-hidden bg-[rgba(47,78,64,0.1)]">
          <div
            className="h-full bg-(--brand-brown) transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
