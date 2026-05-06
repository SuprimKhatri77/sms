import type {
  StockIn,
  StockOut,
  Wastage,
  InventorySummaryRow,
  Product,
} from "../types";
// ─── Constants ────────────────────────────────────────────────────────────────

/** Conversion factor: backend stores monetary values in cents */
export const CENTS_DIVISOR = 100;

export const PRODUCT_UNITS = ["pieces", "kg", "liters", "sets"] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Converts a cents integer to a formatted Rs. string.
 * e.g. 125000 → "Rs. 1,250.00"
 */
export function formatAmount(cents: number): string {
  const rupees = cents / CENTS_DIVISOR;
  return `Rs. ${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converts rupees (user input) to cents for backend storage.
 * e.g. 500 → 50000
 */
export function rupeesToCents(rupees: number): number {
  return Math.round(rupees * CENTS_DIVISOR);
}

/**
 * Converts cents to rupees for display in form fields.
 * e.g. 50000 → 500
 */
export function centsToRupees(cents: number): number {
  return cents / CENTS_DIVISOR;
}

// ─── Date ─────────────────────────────────────────────────────────────────────

/** Format ISO date string to a readable date */
export function formatCreatedAt(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Pagination ───────────────────────────────────────────────────────────────

// export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
//   const start = (page - 1) * pageSize;
//   return items.slice(start, start + pageSize);
// }

export function totalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Summary computation from filtered data ───────────────────────────────────

export function computeSummary(
  products: Product[],
  stockIn: StockIn[],
  stockOut: StockOut[],
  wastage: Wastage[],
  fromDate?: string,
  toDate?: string,
): InventorySummaryRow[] {
  const filterByDate = <T extends { date: string }>(items: T[]): T[] => {
    return items.filter((item) => {
      if (fromDate && item.date < fromDate) return false;
      if (toDate && item.date > toDate) return false;
      return true;
    });
  };

  const filteredIn = filterByDate(stockIn);
  const filteredOut = filterByDate(stockOut);
  const filteredWastage = filterByDate(wastage);

  return products.map((product) => {
    const pIn = filteredIn.filter((s) => s.product_id === product.id);
    const pOut = filteredOut.filter((s) => s.product_id === product.id);
    const pWaste = filteredWastage.filter((s) => s.product_id === product.id);

    const stock_in_qty = pIn.reduce((sum, s) => sum + s.qty, 0);
    const stock_out_qty = pOut.reduce((sum, s) => sum + s.qty, 0);
    const wastage_qty = pWaste.reduce((sum, s) => sum + s.qty, 0);
    const closing_qty = stock_in_qty - stock_out_qty - wastage_qty;

    const stock_in_amount = pIn.reduce((sum, s) => sum + s.qty * s.rate, 0);
    const stock_out_amount = pOut.reduce((sum, s) => sum + s.qty * s.rate, 0);
    const wastage_amount = pWaste.reduce((sum, s) => sum + s.qty * s.rate, 0);
    const closing_amount = stock_in_amount - stock_out_amount - wastage_amount;

    return {
      product_id: product.id,
      product_name: product.name,
      product_unit: product.unit,
      stock_in_qty,
      stock_out_qty,
      wastage_qty,
      closing_qty,
      stock_in_amount,
      stock_out_amount,
      wastage_amount,
      closing_amount,
    };
  });
}

/** Page size for all paginated tables */
export const PAGE_SIZE = 10;

/** Slice an array for a given page */
export function paginate<T>(data: T[], page: number, size = PAGE_SIZE): T[] {
  return data.slice((page - 1) * size, page * size);
}

/**
 * Compute InventorySummaryRow[] from raw transaction arrays.
 * Used by SummaryClient for date-filtered re-computation.
 */
// export function computeSummary(
//   products: import("../types").Product[],
//   stockIn: import("../types").StockIn[],
//   stockOut: import("../types").StockOut[],
//   wastage: import("../types").Wastage[],
// ): import("../types").InventorySummaryRow[] {
//   return products.map((p) => {
//     const inRows = stockIn.filter((r) => r.product_id === p.id);
//     const outRows = stockOut.filter((r) => r.product_id === p.id);
//     const wastRows = wastage.filter((r) => r.product_id === p.id);

//     const stock_in_qty = inRows.reduce((s, r) => s + r.qty, 0);
//     const stock_out_qty = outRows.reduce((s, r) => s + r.qty, 0);
//     const wastage_qty = wastRows.reduce((s, r) => s + r.qty, 0);
//     const closing_qty = stock_in_qty - stock_out_qty - wastage_qty;

//     // amounts are qty × rate (both in cents domain: qty × rate_cents = amount_cents)
//     const stock_in_amount = inRows.reduce((s, r) => s + r.qty * r.rate, 0);
//     const stock_out_amount = outRows.reduce((s, r) => s + r.qty * r.rate, 0);
//     const wastage_amount = wastRows.reduce((s, r) => s + r.qty * r.rate, 0);
//     const closing_amount = stock_in_amount - stock_out_amount - wastage_amount;

//     return {
//       product_id: p.id,
//       product_name: p.name,
//       product_unit: p.unit,
//       stock_in_qty,
//       stock_out_qty,
//       wastage_qty,
//       closing_qty,
//       stock_in_amount,
//       stock_out_amount,
//       wastage_amount,
//       closing_amount,
//     };
//   });
// }
