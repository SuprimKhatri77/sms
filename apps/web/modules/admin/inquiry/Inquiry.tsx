"use client";

import { useState, useMemo } from "react";
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
import InquirySkeleton from "./InquirySkeleton";
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

export interface SourceColorConfig {
  bg: string;
  text: string;
  border: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<string, SourceColorConfig> = {
  website: { bg: "#2d4a3e11", text: "#2d4a3e", border: "#2d4a3e22" },
  facebook: { bg: "#6b9e6b11", text: "#4a7a60", border: "#6b9e6b33" },
  instagram: { bg: "#7d6b8a11", text: "#7d6b8a", border: "#7d6b8a33" },
  referral: { bg: "#e8552a11", text: "#e8552a", border: "#e8552a33" },
  other: { bg: "#d6cbb833", text: "#7d6b8a", border: "#d6cbb8" },
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
  if (sortField !== field) return <SortAsc className="w-3 h-3 opacity-30" />;
  return sortDir === "asc" ? (
    <SortAsc className="w-3 h-3" style={{ color: "#e8552a" }} />
  ) : (
    <SortDesc className="w-3 h-3" style={{ color: "#e8552a" }} />
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
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<ReadFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortableField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [deletingId, setDeletingID] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-inquiries", page],
    queryFn: async () => {
      const res = await api.get<InquiriesList>(`/admin/inquiries?page=${page}`);
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { mutate: markInquiryRead } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<MarkInquiryReadResponse>(
        `/admin/inquiries/${id}`,
      );
      if (!res.data || !res.data.success) throw new Error(res.data.message);
      return res.data;
    },

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["admin-inquiries"] });

      const previousInquiries = queryClient.getQueryData(["admin-inquiries"]);

      queryClient.setQueryData<InquiriesList>(["admin-inquiries"], (old) => {
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
        queryClient.setQueryData(
          ["admin-inquiries"],
          context.previousInquiries,
        );
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
      await queryClient.cancelQueries({ queryKey: ["admin-inquiries"] });
      setDeletingID(id);

      const previousInquiries = queryClient.getQueryData(["admin-inquiries"]);

      queryClient.setQueryData<InquiriesList>(["admin-inquiries"], (old) => {
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
        queryClient.setQueryData(
          ["admin-inquiries"],
          context.previousInquiries,
        );
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
  });

  const filtered = useMemo<Inquiry[]>(() => {
    if (!data || !data.success) return [];
    const { inquiries } = data.data;
    let list = [...inquiries];

    if (filter === "unread") list = list.filter((i) => !i.isRead);
    if (filter === "read") list = list.filter((i) => i.isRead);
    if (sourceFilter !== "all")
      list = list.filter((i) => i.source === sourceFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.fullName.toLowerCase().includes(q) ||
          i.phone.includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      const av = (a[sortField] ?? "").toString().toLowerCase();
      const bv = (b[sortField] ?? "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [filter, sourceFilter, search, sortField, sortDir, data]);

  if (isPending)
    return (
      <div
        className="min-h-screen p-6 md:p-10"
        style={{ backgroundColor: "#faf9f7" }}
      >
        <InquirySkeleton />
      </div>
    );

  if (isError)
    return (
      <div
        className="min-h-screen p-6 md:p-10 flex items-center justify-center"
        style={{ backgroundColor: "#faf9f7" }}
      >
        <InquiryError
          success={false}
          message={"Unable to reach the server"}
          onRetry={refetch}
        />
      </div>
    );

  if (!data.success)
    return (
      <div
        className="min-h-screen p-6 md:p-10 flex items-center justify-center"
        style={{ backgroundColor: "#faf9f7" }}
      >
        <InquiryError
          success={false}
          message={data.message}
          code={data.code}
          onRetry={refetch}
        />
      </div>
    );

  const { inquiries, unreadCount, readCount } = data.data;
  const { limit, total, totalPages } = data.meta;
  const paged = filtered;
  const allSources = [...new Set(inquiries.map((i) => i.source))];

  const statCards: StatCard[] = [
    {
      label: "Total",
      value: total,
      icon: Users,
      color: "#2d4a3e",
      bg: "#2d4a3e0d",
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: Mail,
      color: "#e8552a",
      bg: "#e8552a0d",
    },
    {
      label: "Read",
      value: readCount,
      icon: MailOpen,
      color: "#6b9e6b",
      bg: "#6b9e6b0d",
    },
    {
      label: "Sources",
      value: allSources.length,
      icon: Filter,
      color: "#7d6b8a",
      bg: "#7d6b8a0d",
    },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSort = (field: SortableField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const clearAllFilters = () => {
    setFilter("all");
    setSourceFilter("all");
    setSearch("");
    setPage(1);
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
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#2d4a3e11", color: "#2d4a3e" }}
              >
                Admin
              </span>
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "#2d4a3e", fontFamily: "Georgia, serif" }}
            >
              Inquiries
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7d6b8a" }}>
              Manage and respond to visitor submissions
            </p>
          </div>

          {/* <div className="flex items-center gap-3">
            <button
              onClick={fetchInquiries}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-80 active:scale-95"
              style={{
                borderColor: "#d6cbb8",
                color: "#2d4a3e",
                backgroundColor: "#fff",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#2d4a3e", color: "#fff" }}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>Export CS
          </div> */}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 border flex items-start justify-between"
              style={{ backgroundColor: "#fff", borderColor: "#d6cbb8" }}
            >
              <div>
                <p
                  className="text-xs font-medium mb-1.5"
                  style={{ color: "#7d6b8a" }}
                >
                  {s.label}
                </p>
                <p className="text-3xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: s.bg }}
              >
                <s.icon
                  className="w-5 h-5"
                  style={{ color: s.color }}
                  strokeWidth={1.75}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
          {/* Read filter */}
          <div
            className="flex items-center rounded-xl border p-1 gap-1"
            style={{ backgroundColor: "#fff", borderColor: "#d6cbb8" }}
          >
            {(["all", "unread", "read"] as ReadFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150"
                style={
                  filter === f
                    ? { backgroundColor: "#2d4a3e", color: "#fff" }
                    : { color: "#7d6b8a" }
                }
              >
                {f === "all"
                  ? "All"
                  : f === "unread"
                    ? `Unread (${inquiries.filter((i) => !i.isRead).length})`
                    : `Read (${inquiries.filter((i) => i.isRead).length})`}
              </button>
            ))}
          </div>

          {/* Source filter */}
          {allSources.length > 0 && (
            <div
              className="flex items-center rounded-xl border p-1 gap-1 flex-wrap"
              style={{ backgroundColor: "#fff", borderColor: "#d6cbb8" }}
            >
              <button
                onClick={() => {
                  setSourceFilter("all");
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={
                  sourceFilter === "all"
                    ? { backgroundColor: "#6b9e6b", color: "#fff" }
                    : { color: "#7d6b8a" }
                }
              >
                All Sources
              </button>
              {allSources.map((src) => (
                <button
                  key={src}
                  onClick={() => {
                    setSourceFilter(src);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150"
                  style={
                    sourceFilter === src
                      ? { backgroundColor: "#6b9e6b", color: "#fff" }
                      : { color: "#7d6b8a" }
                  }
                >
                  {src}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="sm:ml-auto relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "#7d6b8a" }}
            />
            <input
              type="text"
              placeholder="Search inquiries…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none w-full sm:w-64"
              style={{
                borderColor: "#d6cbb8",
                backgroundColor: "#fff",
                color: "#2d4a3e",
              }}
            />
          </div>
        </div>

        {/* ── Table or Empty ── */}
        {paged.length === 0 ? (
          <div
            className="rounded-2xl border"
            style={{ backgroundColor: "#fff", borderColor: "#d6cbb8" }}
          >
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
              onRetry={refetch}
            />
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div
              className="hidden lg:block rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "#fff", borderColor: "#d6cbb8" }}
            >
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#2d4a3e08" }}>
                    {tableColumns.map((col) => (
                      <th
                        key={col.label}
                        className={`${col.width} px-4 py-3.5 text-left font-semibold text-xs tracking-wide select-none ${col.field ? "cursor-pointer hover:opacity-70" : ""}`}
                        style={{ color: "#7d6b8a" }}
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
                        className="border-t cursor-pointer"
                        style={{
                          borderColor: "#d6cbb8",
                          backgroundColor: isDeleting
                            ? "#e8552a08"
                            : !inq.isRead
                              ? "#2d4a3e04"
                              : idx % 2 === 0
                                ? "transparent"
                                : "#faf9f7",
                          opacity: isDeleting ? 0.4 : 1,
                          transition: "opacity 0.4s, background-color 0.15s",
                        }}
                        onClick={() => setSelected(inq)}
                      >
                        {/* Name */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{
                                backgroundColor: "#2d4a3e",
                                color: "#fff",
                              }}
                            >
                              {inq.fullName[0].toUpperCase()}
                            </div>
                            <span
                              className="font-semibold truncate max-w-[120px]"
                              style={{ color: "#2d4a3e" }}
                            >
                              {inq.fullName}
                            </span>
                          </div>
                        </td>
                        {/* Phone */}
                        <td className="px-4 py-4">
                          <span
                            className="text-xs"
                            style={{ color: "#2d4a3e" }}
                          >
                            {inq.phone}
                          </span>
                        </td>
                        {/* Email */}
                        <td className="px-4 py-4">
                          <span
                            className="text-xs truncate block max-w-[140px]"
                            style={{ color: "#7d6b8a" }}
                          >
                            {inq.email ?? (
                              <span className="italic opacity-50">—</span>
                            )}
                          </span>
                        </td>
                        {/* Source */}
                        <td className="px-4 py-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize border"
                            style={{
                              backgroundColor: sc.bg,
                              color: sc.text,
                              borderColor: sc.border,
                            }}
                          >
                            {inq.source}
                          </span>
                        </td>
                        {/* Message snippet */}
                        <td className="px-4 py-4">
                          <p
                            className="text-xs truncate max-w-[160px]"
                            style={{ color: "#7d6b8a" }}
                          >
                            {inq.message}
                          </p>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          {inq.isRead ? (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "#6b9e6b11",
                                color: "#4a7a60",
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3" /> Read
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "#e8552a11",
                                color: "#e8552a",
                              }}
                            >
                              <Clock className="w-3 h-3" /> New
                            </span>
                          )}
                        </td>
                        {/* Received */}
                        <td className="px-4 py-4">
                          <span
                            className="text-xs"
                            style={{ color: "#7d6b8a" }}
                          >
                            {timeAgo(String(inq.createdAt))}
                          </span>
                        </td>
                        {/* Actions */}
                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5">
                            <button
                              title="View"
                              onClick={() => setSelected(inq)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                              style={{ backgroundColor: "#2d4a3e11" }}
                            >
                              <Eye
                                className="w-3.5 h-3.5"
                                style={{ color: "#2d4a3e" }}
                              />
                            </button>
                            {!inq.isRead && (
                              <button
                                title="Mark as read"
                                onClick={() => markInquiryRead(inq.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                                style={{ backgroundColor: "#6b9e6b11" }}
                              >
                                <CheckCircle2
                                  className="w-3.5 h-3.5"
                                  style={{ color: "#6b9e6b" }}
                                />
                              </button>
                            )}
                            <button
                              title="Delete"
                              onClick={() => deleteInquiry(inq.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                              style={{ backgroundColor: "#e8552a11" }}
                            >
                              <Trash2
                                className="w-3.5 h-3.5"
                                style={{ color: "#e8552a" }}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="lg:hidden space-y-3">
              {paged.map((inq) => {
                const sc: SourceColorConfig =
                  SOURCE_COLORS[inq.source] ?? SOURCE_COLORS.other;
                return (
                  <div
                    key={inq.id}
                    className="rounded-2xl border p-4 cursor-pointer active:scale-[0.99] transition-all duration-150"
                    style={{
                      backgroundColor: "#fff",
                      borderColor: !inq.isRead ? "#e8552a44" : "#d6cbb8",
                      borderLeftWidth: !inq.isRead ? "3px" : "1px",
                      borderLeftColor: !inq.isRead ? "#e8552a" : "#d6cbb8",
                    }}
                    onClick={() => setSelected(inq)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: "#2d4a3e", color: "#fff" }}
                        >
                          {inq.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: "#2d4a3e" }}
                          >
                            {inq.fullName}
                          </p>
                          <p className="text-xs" style={{ color: "#7d6b8a" }}>
                            {inq.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold border capitalize"
                          style={{
                            backgroundColor: sc.bg,
                            color: sc.text,
                            borderColor: sc.border,
                          }}
                        >
                          {inq.source}
                        </span>
                        {!inq.isRead && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#e8552a" }}
                          />
                        )}
                      </div>
                    </div>

                    <p
                      className="text-xs line-clamp-2 mb-3"
                      style={{ color: "#7d6b8a" }}
                    >
                      {inq.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#7d6b8a" }}>
                        {timeAgo(String(inq.createdAt))}
                      </span>
                      <div
                        className="flex gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelected(inq)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "#2d4a3e11" }}
                        >
                          <Eye
                            className="w-3.5 h-3.5"
                            style={{ color: "#2d4a3e" }}
                          />
                        </button>
                        {!inq.isRead && (
                          <button
                            onClick={() => markInquiryRead(inq.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#6b9e6b11" }}
                          >
                            <CheckCircle2
                              className="w-3.5 h-3.5"
                              style={{ color: "#6b9e6b" }}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => deleteInquiry(inq.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "#e8552a11" }}
                        >
                          <Trash2
                            className="w-3.5 h-3.5"
                            style={{ color: "#e8552a" }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
            <p className="text-sm" style={{ color: "#7d6b8a" }}>
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, filtered.length)} of {total} results
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30"
                style={{ borderColor: "#d6cbb8", backgroundColor: "#fff" }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: "#2d4a3e" }} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className="w-9 h-9 rounded-xl text-sm font-semibold border transition-all"
                  style={
                    page === i + 1
                      ? {
                          backgroundColor: "#2d4a3e",
                          color: "#fff",
                          borderColor: "#2d4a3e",
                        }
                      : {
                          borderColor: "#d6cbb8",
                          backgroundColor: "#fff",
                          color: "#2d4a3e",
                        }
                  }
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30"
                style={{ borderColor: "#d6cbb8", backgroundColor: "#fff" }}
              >
                <ChevronRight
                  className="w-4 h-4"
                  style={{ color: "#2d4a3e" }}
                />
              </button>
            </div>
          </div>
        )}

        {totalPages <= 1 && filtered.length > 0 && (
          <p className="text-xs mt-4" style={{ color: "#7d6b8a" }}>
            {filtered.length} {filtered.length === 1 ? "inquiry" : "inquiries"}{" "}
            found
          </p>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <InquiryDetailModal
        inquiry={selected}
        onClose={() => setSelected(null)}
        onMarkRead={markInquiryRead}
      />
    </div>
  );
}
