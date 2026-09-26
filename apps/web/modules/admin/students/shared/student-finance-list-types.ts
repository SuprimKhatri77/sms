export interface StudentFinanceListFilters {
  page: number;
  from: string;
  to: string;
  search: string;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  limit: number;
  page: number;
}

export interface StudentFinanceListApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  meta?: PaginationMeta;
  data?: T;
}

export interface StudentFinanceRecordStudent {
  studentId: string;
  referenceNo: string;
  fullName: string;
  photoUrl?: string | null;
  email: string;
  phone: string;
}

export interface PaymentListItem extends StudentFinanceRecordStudent {
  paymentId: string;
  amount: number;
  paymentMode: string;
  remarks?: string | null;
  addedBy: string;
  addedAt: string;
  date: string;
  bsDate: string;
}

export interface PaymentsListData {
  payments: PaymentListItem[];
  totalPayments: number;
}

export interface DiscountListItem extends StudentFinanceRecordStudent {
  discountId: string;
  amount: number;
  percent: number | string;
  mode: "percent" | "amount";
  type: string;
  note?: string | null;
  createdAt: string;
}

export interface DiscountsListData {
  discounts: DiscountListItem[];
  totalDiscounts: number;
}

export interface ScholarshipListItem extends StudentFinanceRecordStudent {
  scholarshipId: string;
  amount: number;
  percent: number | string;
  note?: string | null;
  createdAt: string;
}

export interface ScholarshipsListData {
  scholarships: ScholarshipListItem[];
  totalScholarships: number;
}
