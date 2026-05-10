import { JWTUser } from "@repo/types";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export async function getCurrentUser(): Promise<JWTUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) return null;

  try {
    const decoded = jwtDecode<JWTUser & { exp: number }>(accessToken);
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}
