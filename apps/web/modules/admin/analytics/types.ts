// ─── Analytics Data Types ─────────────────────────────────────────────────────

export interface OverviewData {
  totalStudents: number;
  pendingApprovals: number;
  totalRevenue: number;
  studentsWithBalance: number;
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export interface MonthlyAdmission {
  month: string;
  count: number;
}

export interface SourceEntry {
  source: string;
  count: number;
}

export interface StatusBreakdownData {
  pending: number;
  active: number;
  completed: number;
  rejected: number;
}

export interface CourseEntry {
  course: string;
  count: number;
}

export interface MonthlyInquiry {
  month: string;
  count: number;
}

export interface InquiriesData {
  total: number;
  unread: number;
  monthlyInquiries: MonthlyInquiry[];
}

export interface RevenueStatsData {
  thisMonth: number;
  lastMonth: number;
  outstanding: number;
}

export interface AnalyticsResponse {
  overview: OverviewData;
  monthlyRevenue: MonthlyRevenue[];
  monthlyAdmissions: MonthlyAdmission[];
  sourceBreakdown: SourceEntry[];
  statusBreakdown: StatusBreakdownData;
  coursePopularity: CourseEntry[];
  inquiries: InquiriesData;
  revenueStats: RevenueStatsData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const FISCAL_YEAR = "082/083";

export const PAISA_TO_RUPEES = 100;

/** Colors used across analytics charts and cards */
export const CHART_COLORS = {
  primary: "#2f4e40",
  primaryLight: "rgba(47,78,64,0.12)",
  green: "#3a5a49",
  amber: "#c28a4f",
  red: "#9a3412",
  slate: "rgba(47,78,64,0.45)",
} as const;

export const SOURCE_COLORS: Record<string, string> = {
  facebook: "#2f4e40",
  instagram: "#9a3412",
  tiktok: "#1a1a1a",
  referral: "#3a5a49",
  inperson: "#c28a4f",
} as const;

export const STATUS_COLORS: Record<string, string> = {
  active: "#3a5a49",
  completed: "#2f4e40",
  pending: "#c28a4f",
  rejected: "#9a3412",
} as const;

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Format an amount in paisa to NPR currency string.
 * e.g. 450000 → "NPR 4,500"
 */
export function formatNPR(amountInPaisa: number): string {
  const rupees = amountInPaisa / PAISA_TO_RUPEES;
  const formatted = new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(rupees);
  return `NPR ${formatted}`;
}

/**
 * Capitalize a source label for display.
 * e.g. "in_person" → "In Person", "facebook" → "Facebook"
 */
export function formatSourceLabel(source: string): string {
  return source
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
