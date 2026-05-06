import type {
  Product,
  StockIn,
  StockOut,
  Wastage,
  InventorySummaryRow,
} from "../types";

// ─── Products ─────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "T-Shirt",
    unit: "pieces",
    created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: "prod-2",
    name: "Pen",
    unit: "pieces",
    created_at: "2024-01-11T09:00:00Z",
  },
  {
    id: "prod-3",
    name: "Diary",
    unit: "pieces",
    created_at: "2024-01-12T10:00:00Z",
  },
];

// ─── Stock In ─────────────────────────────────────────────────────────────────
// rate is stored in cents (e.g. 50000 = Rs. 500.00)

export const mockStockIn: StockIn[] = [
  {
    id: "si-1",
    product_id: "prod-1",
    product_name: "T-Shirt",
    product_unit: "pieces",
    date: "2081-01-05",
    invoice_no: "INV-001",
    qty: 50,
    rate: 50000, // Rs. 500.00 — first batch
    note: "Opening stock",
    created_at: "2024-04-18T08:00:00Z",
  },
  {
    id: "si-2",
    product_id: "prod-1",
    product_name: "T-Shirt",
    product_unit: "pieces",
    date: "2081-02-10",
    invoice_no: null,
    qty: 30,
    rate: 55000, // Rs. 550.00 — price increased in second batch
    note: "Restock",
    created_at: "2024-05-23T09:00:00Z",
  },
  {
    id: "si-3",
    product_id: "prod-2",
    product_name: "Pen",
    product_unit: "pieces",
    date: "2081-01-08",
    invoice_no: "INV-002",
    qty: 200,
    rate: 1500, // Rs. 15.00
    note: null,
    created_at: "2024-04-21T10:00:00Z",
  },
  {
    id: "si-4",
    product_id: "prod-3",
    product_name: "Diary",
    product_unit: "pieces",
    date: "2081-01-15",
    invoice_no: "INV-003",
    qty: 40,
    rate: 25000, // Rs. 250.00
    note: "Annual diary order",
    created_at: "2024-04-28T11:00:00Z",
  },
];

// ─── Stock Out ────────────────────────────────────────────────────────────────

export const mockStockOut: StockOut[] = [
  {
    id: "so-1",
    product_id: "prod-1",
    product_name: "T-Shirt",
    product_unit: "pieces",
    date: "2081-01-20",
    bill_no: "BILL-101",
    qty: 15,
    rate: 50000,
    note: "Retail sale",
    created_at: "2024-05-03T08:30:00Z",
  },
  {
    id: "so-2",
    product_id: "prod-2",
    product_name: "Pen",
    product_unit: "pieces",
    date: "2081-02-01",
    bill_no: null,
    qty: 80,
    rate: 1500,
    note: "Bulk order",
    created_at: "2024-05-14T09:00:00Z",
  },
  {
    id: "so-3",
    product_id: "prod-3",
    product_name: "Diary",
    product_unit: "pieces",
    date: "2081-02-05",
    bill_no: "BILL-102",
    qty: 10,
    rate: 25000,
    note: null,
    created_at: "2024-05-18T10:00:00Z",
  },
  {
    id: "so-4",
    product_id: "prod-1",
    product_name: "T-Shirt",
    product_unit: "pieces",
    date: "2081-02-18",
    bill_no: "BILL-103",
    qty: 20,
    rate: 55000,
    note: "Online order dispatch",
    created_at: "2024-06-01T11:00:00Z",
  },
];

// ─── Wastage ──────────────────────────────────────────────────────────────────

export const mockWastage: Wastage[] = [
  {
    id: "wa-1",
    product_id: "prod-1",
    product_name: "T-Shirt",
    product_unit: "pieces",
    date: "2081-02-15",
    qty: 3,
    rate: 50000,
    reason: "Print defect",
    created_at: "2024-05-28T08:00:00Z",
  },
  {
    id: "wa-2",
    product_id: "prod-2",
    product_name: "Pen",
    product_unit: "pieces",
    date: "2081-02-20",
    qty: 10,
    rate: 1500,
    reason: "Ink dried out",
    created_at: "2024-06-02T09:00:00Z",
  },
  {
    id: "wa-3",
    product_id: "prod-3",
    product_name: "Diary",
    product_unit: "pieces",
    date: "2081-02-22",
    qty: 2,
    rate: 25000,
    reason: null,
    created_at: "2024-06-05T10:00:00Z",
  },
];

// ─── Summary ──────────────────────────────────────────────────────────────────
// Pre-computed from the mock transactions above.
// T-Shirt: in=80, out=35, wastage=3, closing=42
//   in_amount  = 50*50000 + 30*55000 = 2500000+1650000 = 4150000
//   out_amount = 15*50000 + 20*55000 = 750000+1100000  = 1850000
//   wa_amount  = 3*50000 = 150000
//   closing_amount = 4150000 - 1850000 - 150000 = 2150000
// Pen: in=200, out=80, wastage=10, closing=110
//   in_amount  = 200*1500 = 300000
//   out_amount = 80*1500  = 120000
//   wa_amount  = 10*1500  = 15000
//   closing_amount = 165000
// Diary: in=40, out=10, wastage=2, closing=28
//   in_amount  = 40*25000 = 1000000
//   out_amount = 10*25000 = 250000
//   wa_amount  = 2*25000  = 50000
//   closing_amount = 700000

export const mockSummary: InventorySummaryRow[] = [
  {
    product_id: "prod-1",
    product_name: "T-Shirt",
    product_unit: "pieces",
    stock_in_qty: 80,
    stock_out_qty: 35,
    wastage_qty: 3,
    closing_qty: 42,
    stock_in_amount: 4150000,
    stock_out_amount: 1850000,
    wastage_amount: 150000,
    closing_amount: 2150000,
  },
  {
    product_id: "prod-2",
    product_name: "Pen",
    product_unit: "pieces",
    stock_in_qty: 200,
    stock_out_qty: 80,
    wastage_qty: 10,
    closing_qty: 110,
    stock_in_amount: 300000,
    stock_out_amount: 120000,
    wastage_amount: 15000,
    closing_amount: 165000,
  },
  {
    product_id: "prod-3",
    product_name: "Diary",
    product_unit: "pieces",
    stock_in_qty: 40,
    stock_out_qty: 10,
    wastage_qty: 2,
    closing_qty: 28,
    stock_in_amount: 1000000,
    stock_out_amount: 250000,
    wastage_amount: 50000,
    closing_amount: 700000,
  },
];

// ─── Helper: latest stock-in rate per product ─────────────────────────────────
// Used to autofill rate field in stock-out and wastage forms.

export function getLatestStockInRate(productId: string): number | null {
  const entries = mockStockIn
    .filter((s) => s.product_id === productId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return entries.length > 0 ? entries[0].rate : null;
}
