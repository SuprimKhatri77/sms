import type { MonthlyAdmission, MonthlyInquiry, MonthlyRevenue } from "../types";

export function hasRevenueData(data: MonthlyRevenue[]): boolean {
  return data.some((item) => item.amount > 0);
}

export function hasAdmissionData(data: MonthlyAdmission[]): boolean {
  return data.some((item) => item.count > 0);
}

export function hasSourceData(data: { count: number }[]): boolean {
  return data.some((item) => item.count > 0);
}

export function hasStatusData(data: {
  pending: number;
  active: number;
  completed: number;
  rejected: number;
}): boolean {
  return (
    data.pending + data.active + data.completed + data.rejected > 0
  );
}

export function hasCourseData(data: { count: number }[]): boolean {
  return data.length > 0 && data.some((item) => item.count > 0);
}

export function hasInquiryData(data: {
  total: number;
  monthlyInquiries: MonthlyInquiry[];
}): boolean {
  return data.total > 0 || data.monthlyInquiries.some((item) => item.count > 0);
}
