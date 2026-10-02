import { AccountGroupsClient } from "@/modules/admin/accounting/account-groups/AccountGroupsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Groups — Admin | Bake & Brew Barista Coffee School",
  description: "Manage account groups and the primary heads they belong to.",
};

export default function AccountGroupsPage() {
  return <AccountGroupsClient />;
}
