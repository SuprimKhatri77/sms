import { AdminProfile } from "@/modules/admin/profile/AdminProfile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile — Admin | Bake & Brew Barista Coffee School",
  description: "Update your admin profile.",
};

export default function Page() {
  return <AdminProfile />;
}
