import { NextRequest, NextResponse } from "next/server";
import { attemptRefresh, getSession } from "@/lib/middleware/auth";
import { PUBLIC_ROUTES, ROLE_RULES } from "./lib/middleware/config";

export async function proxy(req: NextRequest) {
  console.log("got triggered");

  const { pathname } = req.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));
  console.log("is public route: ", isPublicRoute);
  const requiredRoles = Object.entries(ROLE_RULES).find(([path]) =>
    pathname.startsWith(path),
  )?.[1];

  // handle public routes — redirect away if already logged in
  if (isPublicRoute) {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (refreshToken) {
      // has refresh token — assume logged in, send to admin
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  }

  // not a protected route → pass through
  if (!requiredRoles) return NextResponse.next();

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // no refresh token at all → definitely not logged in
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // try to get session from access token
  if (accessToken) {
    const user = await getSession(accessToken);

    if (user) {
      console.log("role: ", user.role);
      // logged in but wrong role
      if (!requiredRoles.includes(user.role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      // all good
      return NextResponse.next();
    }
  }

  // access token missing or expired → attempt refresh
  return attemptRefresh(refreshToken, req, requiredRoles);
}

export const config = {
  matcher: ["/admin/:path*", "/auth"],
};
