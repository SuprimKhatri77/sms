import type { CourseDetailResponse, CoursesList } from "@repo/types";
import { getApiUrl } from "@/lib/api-url";

const FEE_TIMEOUT_MS = 5000;

/**
 * Course fees from the backend, keyed by course name (lowercase, as the
 * backend stores it), in paisa. Returns null when the fees can't be loaded
 * so the page can still render without them.
 */
export async function getCourseFees(): Promise<Map<string, number> | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/courses`, {
      signal: AbortSignal.timeout(FEE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CoursesList;
    if (!data.success) return null;
    return new Map(data.data.map((course) => [course.name, course.fee]));
  } catch {
    return null;
  }
}

/**
 * One course's fee in paisa, by slug. Works for unlisted courses too (the
 * list endpoint only returns active ones). Null when it can't be loaded.
 */
export async function getCourseFee(slug: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${getApiUrl()}/api/v1/courses/${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(FEE_TIMEOUT_MS) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as CourseDetailResponse;
    return data.success ? data.data.fee : null;
  } catch {
    return null;
  }
}

const npr = new Intl.NumberFormat("en-NP");

/** "NPR 25,000" from a fee in paisa. */
export function formatFee(feeInPaisa: number) {
  return `NPR ${npr.format(feeInPaisa / 100)}`;
}
