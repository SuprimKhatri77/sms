import { NextRequest, NextResponse } from "next/server";
import {
  attemptRefresh,
  getSession,
  getSessionFromRequest,
} from "@/lib/middleware/auth";
import { PUBLIC_ROUTES, ROLE_RULES } from "./lib/middleware/config";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("middleware triggered:", pathname);

  const isPublicRoute = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));
  const requiredRoles = Object.entries(ROLE_RULES).find(([path]) =>
    pathname.startsWith(path),
  )?.[1];

  if (isPublicRoute) {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (refreshToken) {
      const user = await getSessionFromRequest(req);
      if (user?.role === "student")
        return NextResponse.redirect(new URL("/dashboard", req.url));
      if (user?.role === "admin" || user?.role === "superadmin")
        return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!requiredRoles) {
    console.log("no role rules for path, passing through");
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  console.log(
    "has access token:",
    !!accessToken,
    "has refresh token:",
    !!refreshToken,
  );

  if (!refreshToken) {
    console.log("no refresh token, redirecting to /auth");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (accessToken) {
    const user = await getSession(accessToken);
    console.log("session user:", user?.role ?? "null");

    if (user) {
      if (!requiredRoles.includes(user.role)) {
        console.log("wrong role, redirecting to /");
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }
  }

  console.log("attempting refresh...");
  return attemptRefresh(refreshToken, req, requiredRoles);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/admission/:path*",
    "/auth/:path*",
  ],
};
