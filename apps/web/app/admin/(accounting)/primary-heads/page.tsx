import { PrimaryHeadsClient } from "@/modules/admin/accounting/primary-heads/PrimaryHeadsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Primary Heads — Admin | Bake & Brew Barista Coffee School",
  description: "Manage the primary heads of the chart of accounts.",
};

export default function PrimaryHeadsPage() {
  return <PrimaryHeadsClient />;
}
