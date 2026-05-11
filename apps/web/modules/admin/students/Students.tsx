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
    <div className="min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-[1.8rem] font-bold leading-tight text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Students
            </h1>
            <p
              className="mt-0.5 text-[0.82rem] text-[#2d4a3e]/50"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {filtered.length} student{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Total pill */}
          <div
            className="inline-flex items-center gap-1.5 border border-[#2d4a3e]/20 bg-white px-3 py-1.5 text-[0.78rem] font-medium text-[#2d4a3e]/60"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <StudentIcon className="h-3.5 w-3.5" />
            Total: {totalStudents}
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div className="mb-0 flex flex-col gap-0 border border-[#2d4a3e]/12 bg-white">
          {/* Top row: search + filter toggle */}
          <div className="flex items-stretch border-b border-[#2d4a3e]/10">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2d4a3e]/30"
                strokeWidth={1.75}
              />
              <input
                type="text"
                placeholder="Search by name, reference or phone…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-full w-full border-0 bg-transparent py-3 pl-10 pr-4 text-[0.88rem] text-[#2d4a3e] outline-none placeholder:text-[#2d4a3e]/30 focus:ring-0"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              />
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 border-l border-[#2d4a3e]/10 px-4 py-3 text-[0.82rem] font-medium text-[#2d4a3e] sm:hidden"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
              Filters
              {(statusFilter !== "all" || courseFilter !== "all") && (
                <span className="flex h-4 w-4 items-center justify-center bg-(--brand-brown) text-[0.6rem] font-bold text-white">
                  {
                    [statusFilter !== "all", courseFilter !== "all"].filter(
                      Boolean,
                    ).length
                  }
                </span>
              )}
            </button>
          </div>

          {/* Filter row — always visible sm+, toggled on mobile */}
          <div
            className={`${filterOpen ? "flex" : "hidden sm:flex"} flex-col gap-0 sm:flex-row sm:items-stretch`}
          >
            {/* Status */}
            <div className="relative border-b border-[#2d4a3e]/10 sm:border-b-0 sm:border-r">
              <select
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value as Status | "all")}
                className="w-full appearance-none bg-white py-2.5 pl-4 pr-8 text-[0.82rem] font-medium text-[#2d4a3e] outline-none sm:w-44"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <option value="all">All Statuses</option>
                {(Object.keys(STATUS_META) as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#2d4a3e]/35" />
            </div>

            {/* Course */}
            <div className="relative border-b border-[#2d4a3e]/10 sm:border-b-0 sm:border-r">
              <select
                value={courseFilter}
                onChange={(e) => handleCourse(e.target.value)}
                className="w-full appearance-none bg-white py-2.5 pl-4 pr-8 text-[0.82rem] font-medium text-[#2d4a3e] outline-none sm:w-44"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <option value="all">All Courses</option>
                {COURSES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#2d4a3e]/35" />
            </div>

            {/* Clear */}
            {(statusFilter !== "all" || courseFilter !== "all") && (
              <button
                onClick={() => {
                  handleStatus("all");
                  handleCourse("all");
                }}
                className="border-b border-[#2d4a3e]/10 px-4 py-2.5 text-left text-[0.82rem] font-medium text-(--brand-brown) sm:border-b-0 sm:border-r"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="border border-t-0 border-[#2d4a3e]/12 bg-white">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#2d4a3e]/10 bg-[#2d4a3e]">
                  {[
                    "Reference",
                    "Student",
                    "Phone",
                    "Courses",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/60 first:pl-5"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center text-[0.88rem] text-[#2d4a3e]/35"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      No students match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={`group border-b border-[#2d4a3e]/08 transition-colors hover:bg-[#2d4a3e]/3 ${idx === paginated.length - 1 ? "border-b-0" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="font-mono text-[0.72rem] text-[#2d4a3e]/40"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {student.referenceNo}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[0.9rem] font-semibold text-[#2d4a3e]"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {student.fullName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[0.84rem] text-[#2d4a3e]/55"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {student.phone}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {student.courses.map((c) => (
                            <span
                              key={c}
                              className="border border-[#2d4a3e]/15 bg-[#2d4a3e]/06 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[#2d4a3e]/70"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      {/* <td className="px-5 py-3.5">
                        <span
                          className="text-[0.88rem] font-semibold tabular-nums text-[#2d4a3e]"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          NPR {(student.claimedAmount / 100).toLocaleString()}
                        </span>
                      </td> */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="border border-[#2d4a3e]/20 px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wide text-[#2d4a3e]/70 transition-all hover:border-(--brand-brown) hover:bg-(--brand-brown) hover:text-white"
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

          {/* Mobile card list */}
          <div className="divide-y divide-[#2d4a3e]/08 sm:hidden">
            {/* Mobile header */}
            <div className="bg-[#2d4a3e] px-4 py-2.5">
              <span
                className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white/50"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Students
              </span>
            </div>

            {paginated.length === 0 ? (
              <div
                className="py-16 text-center text-[0.88rem] text-[#2d4a3e]/35"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                No students match your filters.
              </div>
            ) : (
              paginated.map((student) => (
                <div key={student.id} className="px-4 py-4">
                  {/* Top row: name + status */}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-[0.92rem] font-semibold text-[#2d4a3e]"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {student.fullName}
                      </p>
                      <p
                        className="mt-0.5 font-mono text-[0.7rem] text-[#2d4a3e]/40"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {student.referenceNo}
                      </p>
                    </div>
                    <StatusBadge status={student.status} />
                  </div>

                  {/* Details grid */}
                  <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <p
                        className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#2d4a3e]/35"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        Phone
                      </p>
                      <p
                        className="text-[0.82rem] text-[#2d4a3e]/65"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {student.phone}
                      </p>
                    </div>
                    {/* <div>
                      <p
                        className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#2d4a3e]/35"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        Claimed
                      </p>
                      <p
                        className="text-[0.82rem] font-semibold tabular-nums text-[#2d4a3e]"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        NPR {(student.claimedAmount / 100).toLocaleString()}
                      </p>
                    </div> */}
                  </div>

                  {/* Courses + View */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1">
                      {student.courses.map((c) => (
                        <span
                          key={c}
                          className="border border-[#2d4a3e]/15 bg-[#2d4a3e]/05 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[#2d4a3e]/60"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="shrink-0 border border-[#2d4a3e]/20 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-wide text-[#2d4a3e]/70 transition-all hover:border-(--brand-brown) hover:bg-(--brand-brown) hover:text-white"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#2d4a3e]/10 px-5 py-3.5">
              <p
                className="text-[0.78rem] text-[#2d4a3e]/40"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of {totalStudents}
              </p>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center border border-[#2d4a3e]/15 bg-white text-[#2d4a3e] transition-colors hover:bg-[#2d4a3e]/05 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
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
                        className="-ml-px flex h-8 w-8 items-center justify-center border border-[#2d4a3e]/15 bg-white text-[0.78rem] text-[#2d4a3e]/35"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`-ml-px flex h-8 w-8 items-center justify-center border text-[0.78rem] font-semibold transition-colors ${
                          page === p
                            ? "border-[#2d4a3e] bg-[#2d4a3e] text-white"
                            : "border-[#2d4a3e]/15 bg-white text-[#2d4a3e] hover:bg-[#2d4a3e]/05"
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
                  className="-ml-px flex h-8 w-8 items-center justify-center border border-[#2d4a3e]/15 bg-white text-[#2d4a3e] transition-colors hover:bg-[#2d4a3e]/05 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
