import { env } from "@/utils/env";
import { getAllCookies } from "@/utils/get-all-cookies";

interface APIResponse {
  success: boolean;
  message: string;
}
export async function Logout(): Promise<APIResponse> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/logout`, {
    method: "POST",
    headers: {
      Cookie: await getAllCookies(),
    },
  });

  const data = (await res.json()) as APIResponse;
  if (!res.ok) return { success: false, message: "Something went wrong" };

  return data;
}
