"use client";

import { useState, useMemo, useTransition, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
  MailOpen,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import InquiryError from "./InquiryError";
import InquiryListSkeleton from "./InquirySkeleton";
import { cn } from "@/lib/utils";
import InquiryEmpty from "./InquiryEmpty";
import InquiryDetailModal from "./InquiryDetailModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  DeleteInquiryResponse,
  InquiriesList,
  MarkInquiryReadResponse,
} from "@repo/types";
import { toast } from "sonner";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { useAdminClearFiltersShortcut, useAdminFocusSearchShortcut } from "@/components/admin/admin-shortcut-provider";
import {
  adminIconButtonClass,
  adminDangerIconButtonClass,
  adminInputClass,
  adminSegmentActiveClass,
  adminSegmentInactiveClass,
  adminTableClass,
} from "@/components/admin/admin-styles";

export type Inquiry = Extract<
  InquiriesList,
  { success: true }
>["data"]["inquiries"][number];

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
}

export type ReadFilter = "all" | "unread" | "read";
export type SortDirection = "asc" | "desc";
export type SortableField = keyof Pick<
  Inquiry,
  "fullName" | "phone" | "email" | "source" | "isRead" | "createdAt"
>;

function readFilterFromParam(isRead: string | null): ReadFilter {
  if (isRead === "true") return "read";
  if (isRead === "false") return "unread";
  return "all";
}

function readFilterToParam(filter: ReadFilter): string | null {
  if (filter === "read") return "true";
  if (filter === "unread") return "false";
  return null;
}

export interface SourceColorConfig {
  bg: string;
  text: string;
  border: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<string, SourceColorConfig> = {
  website: { bg: "rgba(47,78,64,0.08)", text: "#2f4e40", border: "rgba(47,78,64,0.2)" },
  facebook: { bg: "rgba(58,90,73,0.08)", text: "#3a5a49", border: "rgba(58,90,73,0.2)" },
  instagram: { bg: "rgba(194,138,79,0.1)", text: "#a06d3a", border: "rgba(194,138,79,0.25)" },
  referral: { bg: "rgba(194,138,79,0.14)", text: "#8f5f31", border: "rgba(194,138,79,0.3)" },
  other: { bg: "rgba(251,250,247,0.9)", text: "#7a5a38", border: "rgba(47,78,64,0.15)" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SortIconProps {
  field: SortableField;
  sortField: SortableField;
  sortDir: SortDirection;
}

function SortIcon({ field, sortField, sortDir }: SortIconProps) {
  if (sortField !== field) {
    return <SortAsc className="h-3 w-3 opacity-30 text-[rgba(47,78,64,0.45)]" />;
  }
  return sortDir === "asc" ? (
    <SortAsc className="h-3 w-3 text-(--brand-brown)" />
  ) : (
    <SortDesc className="h-3 w-3 text-(--brand-brown)" />
  );
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminInquiryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const isReadParam = searchParams.get("is_read");
  const filter = readFilterFromParam(isReadParam);
  const sourceFilter = searchParams.get("source") ?? "all";

  const [searchInput, setSearchInput] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchInput(search);
  }

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sortField, setSortField] = useState<SortableField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [deletingId, setDeletingID] = useState<string>("");
  const queryClient = useQueryClient();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === "" ||
          (key === "page" && value === "1")
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if ("search" in updates || "is_read" in updates || "source" in updates) {
        params.delete("page");
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams({ search: value || null });
  }, 400);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (isReadParam === "true" || isReadParam === "false") {
      params.set("is_read", isReadParam);
    }
    if (sourceFilter !== "all") {
      params.set("source", sourceFilter);
    }
    return params.toString();
  }, [page, search, isReadParam, sourceFilter]);

  const { data, isPending, isError, isRefetching, refetch } = useQuery({
    queryKey: ["admin-inquiries", page, search, isReadParam, sourceFilter],
    queryFn: async () => {
      const res = await api.get<InquiriesList>(`/admin/inquiries?${queryString}`);
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const inquiryQueryKey = [
    "admin-inquiries",
    page,
    search,
    isReadParam,
    sourceFilter,
  ] as const;

  const { mutate: markInquiryRead } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<MarkInquiryReadResponse>(
        `/admin/inquiries/${id}`,
      );
      if (!res.data || !res.data.success) throw new Error(res.data.message);
      return res.data;
    },

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: inquiryQueryKey });

      const previousInquiries = queryClient.getQueryData(inquiryQueryKey);

      queryClient.setQueryData<InquiriesList>(inquiryQueryKey, (old) => {
        if (!old || !old.success) return old;
        return {
          ...old,
          data: {
            ...old.data,
            inquiries: old.data.inquiries.map((i) =>
              i.id === id ? { ...i, isRead: true } : i,
            ),
          },
        };
      });

      return { previousInquiries };
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error, _, context) => {
      if (context?.previousInquiries) {
        queryClient.setQueryData(inquiryQueryKey, context.previousInquiries);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
  });
  const { mutate: deleteInquiry } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteInquiryResponse>(
        `/admin/inquiries/${id}`,
      );
      if (!res.data || !res.data.success) throw new Error(res.data.message);
      return res.data;
    },

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: inquiryQueryKey });
      setDeletingID(id);

      const previousInquiries = queryClient.getQueryData(inquiryQueryKey);

      queryClient.setQueryData<InquiriesList>(inquiryQueryKey, (old) => {
        if (!old || !old.success) return old;
        return {
          ...old,
          data: {
            ...old.data,
            inquiries: old.data.inquiries.filter((i) => i.id !== id),
          },
        };
      });

      return { previousInquiries };
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error, _, context) => {
      setDeletingID("");
      if (context?.previousInquiries) {
        queryClient.setQueryData(inquiryQueryKey, context.previousInquiries);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
  });

  const sorted = useMemo<Inquiry[]>(() => {
    if (!data || !data.success) return [];

    const { inquiries } = data.data;
    if (inquiries.length === 0) return [];

    const list = [...inquiries];

    list.sort((a, b) => {
      const av = (a[sortField] ?? "").toString().toLowerCase();
      const bv = (b[sortField] ?? "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [sortField, sortDir, data]);

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    updateParams({
      is_read: null,
      source: null,
      search: null,
      page: null,
    });
  }, [updateParams]);

  const focusSearch = useCallback(() => searchInputRef.current?.focus(), []);

  useAdminClearFiltersShortcut(clearAllFilters);
  useAdminFocusSearchShortcut(focusSearch);

  const isInitialLoading = isPending && !data;
  const isInitialError = isError && !data;
  const isApiError = data && !data.success;

  const unreadCount = data?.success ? data.data.unreadCount : 0;
  const readCount = data?.success ? data.data.readCount : 0;
  const allSources = data?.success ? data.data.sources : [];
  const limit = data?.success ? data.meta.limit : 0;
  const total = data?.success ? data.meta.total : 0;
  const totalPages = data?.success ? data.meta.totalPages : 1;
  const paged = sorted;

  const statCards: StatCard[] = [
    { label: "Total", value: total, icon: Users, color: "#2f4e40", bg: "rgba(47,78,64,0.08)" },
    { label: "Unread", value: unreadCount, icon: Mail, color: "#c28a4f", bg: "rgba(194,138,79,0.1)" },
    { label: "Read", value: readCount, icon: MailOpen, color: "#3a5a49", bg: "rgba(58,90,73,0.08)" },
    { label: "Sources", value: allSources.length, icon: Filter, color: "#1a1a1a", bg: "rgba(47,78,64,0.06)" },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSort = (field: SortableField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ── Table column definitions ───────────────────────────────────────────────
  const tableColumns: Array<{
    label: string;
    field: SortableField | null;
    width: string;
  }> = [
    { label: "Name", field: "fullName", width: "w-[22%]" },
    { label: "Phone", field: "phone", width: "w-[14%]" },
    { label: "Email", field: "email", width: "w-[16%]" },
    { label: "Source", field: "source", width: "w-[10%]" },
    { label: "Message", field: null, width: "w-[18%]" },
    { label: "Status", field: "isRead", width: "w-[8%]" },
    { label: "Received", field: "createdAt", width: "w-[8%]" },
    { label: "", field: null, width: "w-[4%]" },
  ];

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <AdminPageLayout
      title="Inquiries"
      description={
        isInitialLoading
          ? "Loading inquiries…"
          : isRefetching
            ? "Refreshing inquiries…"
            : data?.success
              ? `${total} submission${total === 1 ? "" : "s"} in the system`
              : "Manage and respond to visitor submissions"
      }
      maxWidth="wide"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 divide-x divide-y divide-[rgba(47,78,64,0.12)] border border-[rgba(47,78,64,0.18)] lg:grid-cols-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="flex items-start justify-between bg-white p-5"
            >
              <div>
                <p className="font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
                  {s.label}
                </p>
                {isInitialLoading ? (
                  <div className="mt-2 h-8 w-12 animate-pulse bg-[rgba(47,78,64,0.08)]" />
                ) : (
                  <p
                    className="mt-2 font-(family-name:--font-lora) text-2xl font-bold"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                )}
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.12)]"
                style={{ backgroundColor: s.bg }}
              >
                <s.icon
                  className="h-4 w-4"
                  style={{ color: s.color }}
                  strokeWidth={1.75}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
          <div className="flex gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.08)] p-px">
            {(["all", "unread", "read"] as ReadFilter[]).map((f) => (
              <button
                key={f}
                onClick={() =>
                  updateParams({ is_read: readFilterToParam(f) })
                }
                className={`px-3.5 py-2 font-(family-name:--font-dm-sans) text-xs font-semibold capitalize transition-colors ${
                  filter === f
                    ? adminSegmentActiveClass
                    : adminSegmentInactiveClass
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "unread"
                    ? isInitialLoading
                      ? "Unread"
                      : `Unread (${unreadCount})`
                    : isInitialLoading
                      ? "Read"
                      : `Read (${readCount})`}
              </button>
            ))}
          </div>

          {allSources.length > 0 && (
            <div className="flex flex-wrap gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.08)] p-px">
              <button
                onClick={() => updateParams({ source: null })}
                className={`px-3 py-2 font-(family-name:--font-dm-sans) text-xs font-semibold transition-colors ${
                  sourceFilter === "all"
                    ? adminSegmentActiveClass
                    : adminSegmentInactiveClass
                }`}
              >
                All Sources
              </button>
              {allSources.map((src) => (
                <button
                  key={src}
                  onClick={() => updateParams({ source: src })}
                  className={`px-3 py-2 font-(family-name:--font-dm-sans) text-xs font-semibold capitalize transition-colors ${
                    sourceFilter === src
                      ? adminSegmentActiveClass
                      : adminSegmentInactiveClass
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          )}

          <div className="relative sm:ml-auto">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.4)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search inquiries…"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className={`${adminInputClass} w-full py-2.5 pr-4 pl-9 sm:w-64`}
            />
          </div>
        </div>

        {isInitialLoading ? (
          <InquiryListSkeleton />
        ) : isInitialError ? (
          <InquiryError
            variant="inline"
            success={false}
            message="Unable to reach the server"
            onRetry={() => void refetch()}
          />
        ) : isApiError ? (
          <InquiryError
            variant="inline"
            success={false}
            message={data.message}
            code={data.code}
            onRetry={() => void refetch()}
          />
        ) : paged.length === 0 ? (
          <div className="border border-[rgba(47,78,64,0.18)] bg-white">
            <InquiryEmpty
              message={search ? `No results for "${search}"` : undefined}
              activeFilter={
                filter !== "all"
                  ? filter
                  : sourceFilter !== "all"
                    ? sourceFilter
                    : undefined
              }
              onClearFilter={clearAllFilters}
            />
          </div>
        ) : (
          <div
            className={cn(
              "space-y-3 transition-opacity lg:space-y-0",
              isRefetching && "pointer-events-none opacity-60",
            )}
          >
            <div className="hidden overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white lg:block">
              <table className={`${adminTableClass} text-sm`}>
                <thead>
                  <tr className="border-b border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]">
                    {tableColumns.map((col) => (
                      <th
                        key={col.label}
                        className={`${col.width} whitespace-nowrap px-4 py-3 text-left font-(family-name:--font-dm-sans) text-[10px] font-bold tracking-widest text-[rgba(47,78,64,0.45)] uppercase select-none ${col.field ? "cursor-pointer hover:text-(--brand-green)" : ""}`}
                        onClick={
                          col.field
                            ? () => handleSort(col.field as SortableField)
                            : undefined
                        }
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {col.label}
                          {col.field && (
                            <SortIcon
                              field={col.field as SortableField}
                              sortField={sortField}
                              sortDir={sortDir}
                            />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((inq, idx) => {
                    const sc: SourceColorConfig =
                      SOURCE_COLORS[inq.source] ?? SOURCE_COLORS.other;
                    const isDeleting = deletingId === inq.id;

                    return (
                      <tr
                        key={inq.id}
                        className={`cursor-pointer border-t border-[rgba(47,78,64,0.08)] transition-colors hover:bg-[rgba(47,78,64,0.02)] ${
                          isDeleting
                            ? "opacity-40"
                            : !inq.isRead
                              ? "bg-[rgba(47,78,64,0.03)]"
                              : idx % 2 === 1
                                ? "bg-[rgba(251,250,247,0.6)]"
                                : ""
                        }`}
                        onClick={() => setSelected(inq)}
                      >
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-(--brand-green) font-(family-name:--font-dm-sans) text-xs font-bold text-white">
                              {inq.fullName[0].toUpperCase()}
                            </div>
                            <span className="max-w-[120px] truncate font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-green)">
                              {inq.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="font-(family-name:--font-dm-sans) text-xs text-(--brand-ink)">
                            {inq.phone}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="block max-w-[140px] truncate font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                            {inq.email ?? (
                              <span className="italic opacity-50">—</span>
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className="border px-2.5 py-1 font-(family-name:--font-dm-sans) text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: sc.bg,
                              color: sc.text,
                              borderColor: sc.border,
                            }}
                          >
                            {inq.source}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <p className="max-w-[160px] truncate font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                            {inq.message}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {inq.isRead ? (
                            <span className="inline-flex items-center gap-1 border border-[rgba(58,90,73,0.2)] bg-[rgba(58,90,73,0.08)] px-2 py-0.5 font-(family-name:--font-dm-sans) text-xs font-medium text-[#3a5a49]">
                              <CheckCircle2 className="h-3 w-3" /> Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 border border-[rgba(194,138,79,0.25)] bg-[rgba(194,138,79,0.1)] px-2 py-0.5 font-(family-name:--font-dm-sans) text-xs font-semibold text-(--brand-brown)">
                              <Clock className="h-3 w-3" /> New
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                            {timeAgo(String(inq.createdAt))}
                          </span>
                        </td>
                        <td
                          className="whitespace-nowrap px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5">
                            <button
                              title="View"
                              onClick={() => setSelected(inq)}
                              className={adminIconButtonClass}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {!inq.isRead && (
                              <button
                                title="Mark as read"
                                onClick={() => markInquiryRead(inq.id)}
                                className={adminIconButtonClass}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              title="Delete"
                              onClick={() => deleteInquiry(inq.id)}
                              className={adminDangerIconButtonClass}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {paged.map((inq) => {
                const sc: SourceColorConfig =
                  SOURCE_COLORS[inq.source] ?? SOURCE_COLORS.other;
                return (
                  <div
                    key={inq.id}
                    className={`cursor-pointer border bg-white p-4 transition-colors hover:bg-[rgba(47,78,64,0.02)] ${
                      !inq.isRead
                        ? "border-l-[3px] border-l-(--brand-brown) border-[rgba(47,78,64,0.18)]"
                        : "border-[rgba(47,78,64,0.18)]"
                    }`}
                    onClick={() => setSelected(inq)}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-(--brand-green) font-(family-name:--font-dm-sans) text-sm font-bold text-white">
                          {inq.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-green)">
                            {inq.fullName}
                          </p>
                          <p className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                            {inq.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className="border px-2 py-0.5 font-(family-name:--font-dm-sans) text-xs font-semibold capitalize"
                          style={{
                            backgroundColor: sc.bg,
                            color: sc.text,
                            borderColor: sc.border,
                          }}
                        >
                          {inq.source}
                        </span>
                        {!inq.isRead && (
                          <span className="h-2 w-2 bg-(--brand-brown)" />
                        )}
                      </div>
                    </div>

                    <p className="mb-3 line-clamp-2 font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                      {inq.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
                        {timeAgo(String(inq.createdAt))}
                      </span>
                      <div
                        className="flex gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelected(inq)}
                          className={adminIconButtonClass}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {!inq.isRead && (
                          <button
                            onClick={() => markInquiryRead(inq.id)}
                            className={adminIconButtonClass}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteInquiry(inq.id)}
                          className={adminDangerIconButtonClass}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isInitialLoading && !isInitialError && !isApiError && totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.55)]">
              Showing {(page - 1) * limit + 1}–
              {Math.min((page - 1) * limit + paged.length, total)} of {total}{" "}
              results
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => updateParams({ page: String(page - 1) })}
                className="flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white transition-colors disabled:opacity-30 hover:border-(--brand-green)"
              >
                <ChevronLeft className="h-4 w-4 text-(--brand-green)" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParams({ page: String(i + 1) })}
                  className={`h-9 w-9 border font-(family-name:--font-dm-sans) text-sm font-semibold transition-colors ${
                    page === i + 1
                      ? "border-(--brand-green) bg-(--brand-green) text-white"
                      : "border-[rgba(47,78,64,0.18)] bg-white text-(--brand-green) hover:border-(--brand-green)"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white transition-colors disabled:opacity-30 hover:border-(--brand-green)"
              >
                <ChevronRight className="h-4 w-4 text-(--brand-green)" />
              </button>
            </div>
          </div>
        )}

        {!isInitialLoading &&
          !isInitialError &&
          !isApiError &&
          totalPages <= 1 &&
          paged.length > 0 && (
          <p className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
            {total} {total === 1 ? "inquiry" : "inquiries"} found
          </p>
        )}
      </div>

      <InquiryDetailModal
        inquiry={selected}
        onClose={() => setSelected(null)}
        onMarkRead={markInquiryRead}
      />
    </AdminPageLayout>
  );
}
