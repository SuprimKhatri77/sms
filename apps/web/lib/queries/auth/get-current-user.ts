import { env } from "@/utils/env";
import { getAllCookies } from "@/utils/get-all-cookies";
import { User } from "@repo/types";

interface APIResponse {
  success: boolean;
  message: string;
  data: User;
}
export async function getCurrentUser() {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      Cookie: await getAllCookies(),
    },
  });

  const data = (await response.json()) as APIResponse;

  if (!response.ok) return null;

  return data.data;
}
