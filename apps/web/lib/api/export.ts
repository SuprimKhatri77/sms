import axios from "axios";
import api from "@/lib/axios";

export type ExportFormat = "csv" | "xlsx" | "pdf";

// Downloads `${path}/export` output for the given filters. Goes through the
// shared axios instance (not a plain link) so an expired access token is
// refreshed and the request retried like any other admin call.
export async function downloadExport(
  path: string,
  filters: Record<string, string>,
  format: ExportFormat,
): Promise<void> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("format", format);

  let res;
  try {
    res = await api.get<Blob>(`${path}?${params.toString()}`, {
      responseType: "blob",
    });
  } catch (error) {
    throw new Error(await exportErrorMessage(error));
  }

  const filename =
    filenameFromDisposition(res.headers["content-disposition"]) ??
    `export.${format}`;

  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked after a moment; revoking immediately can cancel the download in
  // some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function filenameFromDisposition(header: unknown): string | null {
  if (typeof header !== "string") return null;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1] ?? null;
}

// With responseType "blob" the backend's JSON error body arrives as a Blob,
// so the response interceptor can't lift its message; read it here instead.
async function exportErrorMessage(error: unknown): Promise<string> {
  const fallback = "Export failed. Please try again.";
  if (!axios.isAxiosError(error)) return fallback;

  const data: unknown = error.response?.data;
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text());
      if (typeof body?.message === "string" && body.message) {
        return body.message;
      }
    } catch {
      // not a JSON body; use the fallback
    }
  }
  return fallback;
}
