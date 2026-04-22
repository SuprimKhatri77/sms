import { UsersPageClient } from "@/modules/admin/users/Users";

export const metadata = {
  title: "Users | Admin",
  description: "Manage all users in the system.",
};

export default function AdminUsersPage() {
  return <UsersPageClient />;
}
