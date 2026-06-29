export function formatNpr(amount: number): string {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

type FinanceProgressInput = {
  totalCourseFee: number;
  totalPaid: number;
  totalDiscount: number;
  totalScholarship: number;
};

/** Progress against payable amount (fee minus discounts & scholarship). Amounts in paisa. */
export function getPaymentProgressPct({
  totalCourseFee,
  totalPaid,
  totalDiscount,
  totalScholarship,
}: FinanceProgressInput): number {
  const payable = Math.max(
    totalCourseFee - totalDiscount - totalScholarship,
    0,
  );

  if (payable > 0) {
    return Math.min((totalPaid / payable) * 100, 100);
  }

  return totalPaid > 0 ? 100 : 0;
}
