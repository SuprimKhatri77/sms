import type { JWTUser } from "@repo/types";

export function isAdminRole(
  role: JWTUser["role"] | null | undefined,
): boolean {
  return role === "admin" || role === "superadmin";
}
