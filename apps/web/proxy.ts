import { NextRequest, NextResponse } from "next/server";
import { attemptRefresh, getSession } from "@/lib/middleware/auth";
import {
  ROLE_RULES,
  UNAUTHENTICATED_ONLY_ROUTES,
} from "./lib/middleware/config";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("middleware triggered:", pathname);

  const isUnauthenticatedOnlyRoute = UNAUTHENTICATED_ONLY_ROUTES.some((p) =>
    pathname.startsWith(p),
  );
  const requiredRoles = Object.entries(ROLE_RULES).find(([path]) =>
    pathname.startsWith(path),
  )?.[1];

  if (isUnauthenticatedOnlyRoute) {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) return NextResponse.next();
    console.log(
      "public route hit:",
      req.nextUrl.pathname,
      "has refresh token:",
      !!refreshToken,
    );

    const accessToken = req.cookies.get("access_token")?.value;
    console.log("access token: ", accessToken);

    if (accessToken) {
      const user = getSession(accessToken);
      console.log("user: ", user);
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
