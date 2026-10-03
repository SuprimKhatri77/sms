import EmployeesClient from "@/modules/admin/accounting/employees/EmployeesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employees — Admin | Bake & Brew Barista Coffee School",
  description: "Staff paid through the salary ledger.",
};

export default function EmployeesPage() {
  return <EmployeesClient />;
}
