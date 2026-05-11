export const ROLE_RULES: Record<string, string[]> = {
  "/admin": ["admin", "superadmin"],
  "/dashboard": ["student"],
  "/admission": ["student", "admin", "superadmin"],
};

export const PUBLIC_ROUTES = ["/auth"];

export const UNAUTHENTICATED_ONLY_ROUTES = ["/auth"];
