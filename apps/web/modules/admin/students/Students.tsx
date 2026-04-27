"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ListStudent } from "@repo/types";
import { StudentsPageSkeleton } from "./StudentSkeleton";
import { StudentsError } from "./StudentError";
import { StudentIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "pending" | "active" | "completed" | "rejected";

const COURSES = ["Barista", "Bakery", "Bartending", "Sushi"] as const;
const PAGE_SIZE = 20;

const STATUS_META: Record<Status, { label: string; classes: string }> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50  text-amber-700  border-amber-200",
  },
  active: {
    label: "Active",
    classes: "bg-green-50  text-green-700  border-green-200",
  },
  completed: {
    label: "Completed",
    classes: "bg-blue-50   text-blue-700   border-blue-200",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-50    text-red-700    border-red-200",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.06em]",
        meta.classes,
      )}
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {meta.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState<Status | "all">("all");
  const [courseFilter, setCourse] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data, isPending, refetch, isError } = useQuery({
    queryKey: ["admin-list-students", page],
    queryFn: async () => {
      const res = await api.get<ListStudent>(`/admin/students?page=${page}`);
      return res.data;
    },
  });

  const filtered = useMemo(() => {
    if (!data?.success) return [];

    return data.data.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);

      const matchStatus = statusFilter === "all" || s.status === statusFilter;

      const matchCourse =
        courseFilter === "all" || s.courses.includes(courseFilter);

      return matchSearch && matchStatus && matchCourse;
    });
  }, [data, search, statusFilter, courseFilter]);

  if (isPending) return <StudentsPageSkeleton />;
  if (isError)
    return (
      <StudentsError
        error={{
          message: "Unable to reach the server.",
          code: "NETWORK_ERROR",
        }}
        onRetry={refetch}
        variant="list"
      />
    );
  if (!data || !data.success)
    return (
      <StudentsError
        error={{
          message: data?.message ?? "Something went wrong.",
          code: data?.code ?? "UNKNOWN_ERROR",
        }}
        onRetry={refetch}
        variant="list"
      />
    );

  const totalStudents = data.meta.total;
  const totalPages = data.meta.totalPages;
  const paginated = filtered;

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleStatus = (v: Status | "all") => {
    setStatus(v);
    setPage(1);
  };
  const handleCourse = (v: string) => {
    setCourse(v);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f4f1ec] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-[1.8rem] font-bold leading-tight text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Students
            </h1>
            {filtered && (
              <p
                className="mt-0.5 text-[0.88rem] text-[#2d4a3e]/50"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {filtered.length} student{filtered.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-xl bg-white border border-[#2d4a3e]/10 px-3 py-2 text-[0.8rem] text-[#2d4a3e]/50"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <StudentIcon className="h-3.5 w-3.5" />
              Total: {totalStudents}
            </div>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2d4a3e]/35"
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search by name, reference or phone…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl border border-[#2d4a3e]/12 bg-white py-2.5 pl-10 pr-4 text-[0.9rem] text-[#2d4a3e] outline-none placeholder:text-[#2d4a3e]/30 focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 rounded-xl border border-[#2d4a3e]/12 bg-white px-4 py-2.5 text-[0.88rem] font-medium text-[#2d4a3e] sm:hidden"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Filter className="h-4 w-4" strokeWidth={1.75} />
            Filters
            {(statusFilter !== "all" || courseFilter !== "all") && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8552a] text-[0.65rem] font-bold text-white">
                {
                  [statusFilter !== "all", courseFilter !== "all"].filter(
                    Boolean,
                  ).length
                }
              </span>
            )}
          </button>

          {/* Filters — always visible on sm+ */}
          <div
            className={`flex flex-col gap-2 sm:flex-row sm:gap-2 ${filterOpen ? "flex" : "hidden sm:flex"}`}
          >
            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value as Status | "all")}
                className="w-full appearance-none rounded-xl border border-[#2d4a3e]/12 bg-white py-2.5 pl-4 pr-9 text-[0.88rem] font-medium text-[#2d4a3e] outline-none focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15 sm:w-auto"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <option value="all">All Statuses</option>
                {(Object.keys(STATUS_META) as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#2d4a3e]/40" />
            </div>

            {/* Course filter */}
            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => handleCourse(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#2d4a3e]/12 bg-white py-2.5 pl-4 pr-9 text-[0.88rem] font-medium text-[#2d4a3e] outline-none focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15 sm:w-auto"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <option value="all">All Courses</option>
                {COURSES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#2d4a3e]/40" />
            </div>

            {/* Clear */}
            {(statusFilter !== "all" || courseFilter !== "all") && (
              <button
                onClick={() => {
                  handleStatus("all");
                  handleCourse("all");
                }}
                className="rounded-xl border border-[#e8552a]/30 bg-[#e8552a]/08 px-4 py-2.5 text-[0.88rem] font-medium text-[#e8552a]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#2d4a3e]/08 bg-[#f4f1ec]/60">
                  {[
                    "Reference",
                    "Student",
                    "Phone",
                    "Courses",
                    "Claimed",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/45"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated && paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center text-[0.9rem] text-[#2d4a3e]/40"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      No students match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated &&
                  paginated.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={`border-b border-[#2d4a3e]/06 transition-colors hover:bg-[#f4f1ec]/50 ${paginated && idx === paginated.length - 1 ? "border-b-0" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <span
                          className="font-mono text-[0.78rem] text-[#2d4a3e]/50"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {student.referenceNo}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-[0.92rem] font-medium text-[#2d4a3e]"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {student.fullName}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-[0.88rem] text-[#2d4a3e]/60"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {student.phone}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {student.courses.map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-[#2d4a3e]/08 px-2.5 py-0.5 text-[0.72rem] font-medium text-[#2d4a3e]"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-[0.88rem] font-medium text-[#2d4a3e]"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          NPR {(student.claimedAmount / 100).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="rounded-lg border border-[#2d4a3e]/15 px-3 py-1.5 text-[0.78rem] font-medium text-[#2d4a3e] transition-all hover:border-[#e8552a]/30 hover:bg-[#e8552a]/05 hover:text-[#e8552a]"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#2d4a3e]/08 px-5 py-4">
              <p
                className="text-[0.82rem] text-[#2d4a3e]/45"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {filtered && (
                  <>
                    {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                    {totalStudents}
                  </>
                )}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2d4a3e]/12 bg-white text-[#2d4a3e] transition-all hover:border-[#2d4a3e]/25 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-[0.82rem] text-[#2d4a3e]/35"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.82rem] font-medium transition-all ${
                          page === p
                            ? "bg-[#2d4a3e] text-white"
                            : "border border-[#2d4a3e]/12 bg-white text-[#2d4a3e] hover:border-[#2d4a3e]/25"
                        }`}
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2d4a3e]/12 bg-white text-[#2d4a3e] transition-all hover:border-[#2d4a3e]/25 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
