export function formatNpr(amount: number): string {
  // Whole rupees stay "NPR 25,000"; paisa are shown only when there are some,
  // so e.g. a Rs 0.40 balance doesn't render as "NPR 0".
  const fractionDigits = Math.round(amount * 100) % 100 !== 0 ? 2 : 0;
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

// Label for a payment's mode. A "cash_and_bank" payment is shown as
// "Cash + Bank", with the paisa split per ledger when it's passed in.
export function formatPaymentMode(
  mode: string | null | undefined,
  cashAmount?: number,
  bankAmount?: number,
): string {
  if (mode?.toLowerCase() !== "cash_and_bank") return mode ?? "—";
  if (cashAmount === undefined || bankAmount === undefined) {
    return "Cash + Bank";
  }
  return `Cash + Bank (Cash ${formatNpr(cashAmount / 100)} · Bank ${formatNpr(bankAmount / 100)})`;
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
