import type { CoursesList } from "@repo/types";
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

const npr = new Intl.NumberFormat("en-NP");

/** "NPR 25,000" from a fee in paisa. */
export function formatFee(feeInPaisa: number) {
  return `NPR ${npr.format(feeInPaisa / 100)}`;
}
