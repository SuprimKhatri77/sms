import LedgersClient from "@/modules/admin/accounting/ledgers/LedgersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ledgers — Admin | Bake & Brew Barista Coffee School",
  description: "Cash, bank, supplier and salary ledger entries in one place.",
};

export default function LedgersPage() {
  return <LedgersClient />;
}
