// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  unit: string;
  created_at: string;
};

export type StockIn = {
  id: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  /** Nepali BS date string e.g. "2081-01-15" */
  date: string;
  invoice_no: string | null;
  qty: number;
  /** Stored in cents — divide by 100 before displaying */
  rate: number;
  note: string | null;
  created_at: string;
};

export type StockOut = {
  id: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  date: string;
  bill_no: string | null;
  qty: number;
  /** Stored in cents — divide by 100 before displaying */
  rate: number;
  note: string | null;
  created_at: string;
};

export type Wastage = {
  id: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  date: string;
  qty: number;
  /** Stored in cents — divide by 100 before displaying */
  rate: number;
  reason: string | null;
  created_at: string;
};

export type InventorySummaryRow = {
  product_id: string;
  product_name: string;
  product_unit: string;
  stock_in_qty: number;
  stock_out_qty: number;
  wastage_qty: number;
  closing_qty: number;
  /** All amount fields stored in cents */
  stock_in_amount: number;
  stock_out_amount: number;
  wastage_amount: number;
  closing_amount: number;
};

// ─── Form Value Types ─────────────────────────────────────────────────────────

export type ProductFormValues = {
  name: string;
  unit: string;
};

export type StockInFormValues = {
  product_id: string;
  date: string;
  invoice_no: string;
  qty: number;
  /** User enters in Rs — multiply ×100 before sending to backend */
  rate: number;
  note: string;
};

export type StockOutFormValues = {
  product_id: string;
  date: string;
  bill_no: string;
  qty: number;
  rate: number;
  note: string;
};

export type WastageFormValues = {
  product_id: string;
  date: string;
  qty: number;
  rate: number;
  reason: string;
};

// ─── UI Utility Types ─────────────────────────────────────────────────────────

export type DialogMode = "create" | "edit" | "delete" | null;

export type PaginationState = {
  page: number;
  pageSize: number;
};
