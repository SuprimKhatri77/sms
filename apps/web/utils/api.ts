import { APIResponse } from "@repo/types";

export type ApiError = {
  success: false;
  message: string;
  code: string;
  errors?: {
    code: string;
    field: string;
    message: string;
  }[];
};

export type ApiSuccess<T = undefined> = {
  success: true;
  message: string;
  data?: T;
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiSuccess<T>> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw result as ApiError;
  }

  return result as ApiSuccess<T>;
}

export function mapFieldErrors(error: APIResponse): Record<string, string> {
  return Object.fromEntries(
    (error.errors ?? []).map(({ field, message }) => [field, message]),
  );
}
