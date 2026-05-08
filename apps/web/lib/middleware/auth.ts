import { NextRequest, NextResponse } from "next/server";
import { User } from "@repo/types";

export async function getSession(token: string): Promise<User | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
      {
        headers: { Cookie: `access_token=${token}` },
      },
    );
    console.log("api url in getsession:", process.env.NEXT_PUBLIC_API_URL);
    console.log("response: ", res);
    if (!res.ok) return null;
    const body = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function attemptRefresh(
  refreshToken: string,
  req: NextRequest,
  requiredRoles: string[],
) {
  try {
    console.log("attemptRefresh called, path:", req.nextUrl.pathname);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      },
    );

    console.log("refresh response status:", res.status);

    if (!res.ok) {
      console.log(
        "refresh failed with status:",
        res.status,
        "— clearing cookies:",
        res.status === 401 ? "YES" : "NO",
      );
      if (res.status === 401) {
        console.log("in !res.ok block clearing cookies.....");
        const redirect = NextResponse.redirect(new URL("/auth/login", req.url));
        redirect.cookies.set("access_token", "", {
          maxAge: 0,
          path: "/",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.COOKIE_DOMAIN
              : "",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        });
        redirect.cookies.set("refresh_token", "", {
          maxAge: 0,
          path: "/",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.COOKIE_DOMAIN
              : "",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        });
        return redirect;
      }

      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // get ALL cookies from refresh response
    const cookies = res.headers.getSetCookie();

    // still need the access token value to check role
    const newAccessToken = extractTokenFromCookie(cookies.join("; "));

    if (!newAccessToken) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const user = await getSession(newAccessToken);

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (!requiredRoles.includes(user.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const newRefreshToken = extractRefreshTokenFromCookie(cookies.join("; "));

    const response = NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(req.headers),
          cookie: `access_token=${newAccessToken}; refresh_token=${newRefreshToken}`,
        }),
      },
    });

    cookies.forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });

    return response;
  } catch (error) {
    console.log("attemptRefresh threw an error:", error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export async function getSessionFromRequest(
  req: NextRequest,
): Promise<User | null> {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) return null;

  if (accessToken) {
    const user = await getSession(accessToken);
    if (user) return user;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
    {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    },
  );

  if (!res.ok) return null;

  const cookies = res.headers.getSetCookie();
  const newAccessToken = extractTokenFromCookie(cookies.join("; "));
  if (!newAccessToken) return null;

  return getSession(newAccessToken);
}

// parses access_token value out of the set-cookie header string
export function extractTokenFromCookie(
  setCookie: string | null,
): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/access_token=([^;]+)/);
  return match?.[1] ?? null;
}

export function extractRefreshTokenFromCookie(
  setCookie: string | null,
): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/refresh_token=([^;]+)/);
  return match?.[1] ?? null;
}
