import { BanksClient } from "@/modules/admin/accounting/banks/BanksClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banks — Admin | Bake & Brew Barista Coffee School",
  description: "Manage bank payment accounts for Bake & Brew Academy.",
};

export default function Page() {
  return <BanksClient />;
}
