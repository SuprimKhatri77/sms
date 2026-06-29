"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  GraduationCap,
  ChevronDown,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ListStudent } from "@repo/types";
import { StudentsError } from "./StudentError";
import { cn } from "@/lib/utils";
import { useDebounce } from "../analytics/hooks/useDebounce";
import { StudentCard } from "./StudentCard";
import { useStudentBatches } from "@/hooks/queries/admin/students/useStudentBtaches";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  adminInputClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { STUDENT_STATUS_META, type StudentStatus } from "./shared/student-status";

type Status = StudentStatus;

const COURSES = ["Barista", "Bakery", "Bartending", "Sushi"] as const;
const SHIFTS = ["morning", "day", "evening"] as const;

const filterSelectClass = (active: boolean) =>
  cn(
    "appearance-none cursor-pointer border py-2 pl-3 pr-8 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] outline-none transition-colors",
    active
      ? "border-(--brand-green) bg-(--brand-green) text-white"
      : "border-[rgba(47,78,64,0.18)] bg-white text-[rgba(47,78,64,0.55)] hover:border-(--brand-green) hover:text-(--brand-green)",
  );

export default function StudentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const statusFilter = (searchParams.get("status") ?? "all") as Status | "all";
  const courseFilter = searchParams.get("course") ?? "all";
  const shiftFilter = searchParams.get("shift") ?? "all";
  const batchFilter = searchParams.get("batch") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const debouncedSearch = useDebounce(searchInput, 400);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "" || val === "all") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      if (!("page" in updates)) params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    updateParams({ q: debouncedSearch });
  }, [debouncedSearch]);

  const handleStatus = (v: Status | "all") => updateParams({ status: v });
  const handleCourse = (v: string) => updateParams({ course: v });
  const handlePage = (p: number) => {
    updateParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleShift = (v: string) => updateParams({ shift: v });
  const handleBatch = (v: string) => updateParams({ batch: v });
  const clearFilters = () => {
    setSearchInput("");
    updateParams({
      status: null,
      course: null,
      q: null,
      shift: null,
      batch: null,
    });
  };

  const {
    data: batchesData,
    isPending: isBatchesPending,
    isError: isBatchesError,
    error: batchesError,
    refetch: refetchBatches,
  } = useStudentBatches();

  const batches = batchesData?.batches ?? [];
  const showBatchFilter =
    !isBatchesPending && !isBatchesError && batches.length > 0;

  const { data, isPending, refetch, isError } = useQuery({
    queryKey: [
      "admin-list-students",
      page,
      statusFilter,
      courseFilter,
      shiftFilter,
      batchFilter,
      debouncedSearch,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (courseFilter !== "all") params.set("course", courseFilter);
      if (shiftFilter !== "all") params.set("shift", shiftFilter);
      if (batchFilter !== "all") params.set("batch", batchFilter);

      const res = await api.get<ListStudent>(
        `/admin/students?${params.toString()}`,
      );
      return res.data;
    },
  });

  const isSuccess = data?.success === true;
  const students = isSuccess ? data.data : [];
  const totalStudents = isSuccess ? data.meta.total : 0;
  const totalPages = isSuccess ? data.meta.totalPages : 0;

  const activeFilterCount = [
    statusFilter !== "all",
    courseFilter !== "all",
    shiftFilter !== "all",
    batchFilter !== "all",
    searchInput !== "",
  ].filter(Boolean).length;

  const start =
    isSuccess && students.length > 0
      ? (page - 1) * data.meta.limit + 1
      : 0;
  const end =
    isSuccess && students.length > 0 ? start + students.length - 1 : 0;

  return (
    <AdminPageLayout
      title="Students"
      description={
        isPending
          ? "Loading enrolled students…"
          : `${totalStudents} student${totalStudents !== 1 ? "s" : ""} enrolled across all courses`
      }
      maxWidth="wide"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/students/outstanding" className={adminSecondaryButtonClass}>
            <Wallet size={14} />
            Outstanding
          </Link>
          <Link href="/admin/students/sales" className={adminSecondaryButtonClass}>
            <TrendingUp size={14} />
            Sales
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {!isPending && isSuccess ? (
          <div className="grid grid-cols-1 border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.18)] sm:grid-cols-3">
            <div className="bg-white px-5 py-4">
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
                Total Enrolled
              </p>
              <p className="mt-2 font-[family-name:var(--font-lora)] text-2xl font-bold text-(--brand-green)">
                {totalStudents}
              </p>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
                On This Page
              </p>
              <p className="mt-2 font-[family-name:var(--font-lora)] text-2xl font-bold text-(--brand-green)">
                {students.length}
              </p>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
                Active Filters
              </p>
              <p className="mt-2 font-[family-name:var(--font-lora)] text-2xl font-bold text-(--brand-green)">
                {activeFilterCount}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.18)] sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[88px] animate-pulse bg-white" />
            ))}
          </div>
        )}

        <div className="space-y-3 border border-[rgba(47,78,64,0.18)] bg-white p-4 sm:p-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(47,78,64,0.35)]"
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search by name, reference or phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={cn(adminInputClass, "py-2.5 pl-9 pr-9 normal-case tracking-normal")}
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(47,78,64,0.35)] hover:text-(--brand-green)"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value as Status | "all")}
                className={filterSelectClass(statusFilter !== "all")}
              >
                <option value="all">All statuses</option>
                {(Object.keys(STUDENT_STATUS_META) as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {STUDENT_STATUS_META[s].label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={cn(
                  "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2",
                  statusFilter !== "all" ? "text-white/70" : "text-[rgba(47,78,64,0.35)]",
                )}
              />
            </div>

            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => handleCourse(e.target.value)}
                className={filterSelectClass(courseFilter !== "all")}
              >
                <option value="all">All courses</option>
                {COURSES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={cn(
                  "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2",
                  courseFilter !== "all" ? "text-white/70" : "text-[rgba(47,78,64,0.35)]",
                )}
              />
            </div>

            <div className="relative">
              <select
                value={shiftFilter}
                onChange={(e) => handleShift(e.target.value)}
                className={filterSelectClass(shiftFilter !== "all")}
              >
                <option value="all">All shifts</option>
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={cn(
                  "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2",
                  shiftFilter !== "all" ? "text-white/70" : "text-[rgba(47,78,64,0.35)]",
                )}
              />
            </div>

            {isBatchesPending ? (
              <div
                className="h-[38px] w-[7.5rem] animate-pulse border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]"
                aria-label="Loading batches"
              />
            ) : isBatchesError ? (
              <button
                type="button"
                onClick={() => refetchBatches()}
                title={
                  batchesError instanceof Error
                    ? batchesError.message
                    : "Failed to load batches"
                }
                className="border border-red-200 bg-red-50 px-3 py-2 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-red-600 transition-colors hover:bg-red-100"
              >
                Batches failed · Retry
              </button>
            ) : showBatchFilter ? (
              <div className="relative">
                <select
                  value={batchFilter}
                  onChange={(e) => handleBatch(e.target.value)}
                  className={filterSelectClass(batchFilter !== "all")}
                >
                  <option value="all">All batches</option>
                  {batches.map((b, idx) => (
                    <option key={`${b}-${idx}`} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={cn(
                    "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2",
                    batchFilter !== "all" ? "text-white/70" : "text-[rgba(47,78,64,0.35)]",
                  )}
                />
              </div>
            ) : null}

            {activeFilterCount > 0 ? (
              <>
                <div className="hidden h-5 w-px bg-[rgba(47,78,64,0.12)] sm:block" />
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-(--brand-brown) underline-offset-2 hover:underline"
                >
                  Clear all
                </button>
              </>
            ) : null}
          </div>
        </div>

        {isPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden border border-[rgba(47,78,64,0.12)] bg-white"
              >
                <div className="h-0.5 w-full animate-pulse bg-[rgba(47,78,64,0.08)]" />
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-36 animate-pulse bg-[rgba(47,78,64,0.08)]" />
                      <div className="h-3 w-24 animate-pulse bg-[rgba(47,78,64,0.06)]" />
                    </div>
                    <div className="h-5 w-16 animate-pulse bg-[rgba(47,78,64,0.08)]" />
                  </div>
                  <div className="h-10 animate-pulse bg-[rgba(47,78,64,0.04)]" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 animate-pulse bg-[rgba(47,78,64,0.06)]" />
                    <div className="h-5 w-16 animate-pulse bg-[rgba(47,78,64,0.06)]" />
                  </div>
                </div>
                <div className="h-10 animate-pulse border-t border-[rgba(47,78,64,0.08)] bg-[rgba(47,78,64,0.03)]" />
              </div>
            ))}
          </div>
        ) : isError || !isSuccess ? (
          <div className="border border-[rgba(47,78,64,0.18)] bg-white">
            <StudentsError
              error={
                isError
                  ? {
                      message: "Unable to reach the server.",
                      code: "NETWORK_ERROR",
                    }
                  : {
                      message: !data.success
                        ? data.message
                        : "Something went wrong",
                      code: !data.success ? data.code : "SOMETHING_WENT_WRONG",
                    }
              }
              onRetry={refetch}
              variant="list"
            />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white py-24">
            <GraduationCap
              className="mb-4 h-10 w-10 text-[rgba(47,78,64,0.2)]"
              strokeWidth={1.25}
            />
            <p className="font-[family-name:var(--font-lora)] text-lg font-bold text-[rgba(47,78,64,0.45)]">
              No students match your filters
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 font-[family-name:var(--font-dm-sans)] text-sm font-medium text-(--brand-brown) underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}

        {!isPending && totalPages > 1 ? (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.55)]">
              {students.length > 0
                ? `Showing ${start}–${end} of ${totalStudents} students`
                : `Page ${page} of ${totalPages}`}
            </p>

            <div className="flex items-center gap-0">
              <button
                type="button"
                onClick={() => handlePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
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
                      className="-ml-px flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white text-xs text-[rgba(47,78,64,0.35)]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePage(p as number)}
                      className={cn(
                        "-ml-px flex h-9 w-9 items-center justify-center border text-xs font-semibold transition-colors",
                        page === p
                          ? "border-(--brand-green) bg-(--brand-green) text-white"
                          : "border-[rgba(47,78,64,0.18)] bg-white text-(--brand-green) hover:bg-[rgba(47,78,64,0.04)]",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                type="button"
                onClick={() => handlePage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="-ml-px flex h-9 w-9 items-center justify-center border border-[rgba(47,78,64,0.18)] bg-white text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminPageLayout>
  );
}
