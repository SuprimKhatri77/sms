"use client";

import {
  BookOpen,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GetStudentCoursesResponse } from "@repo/types";
import api from "@/lib/axios";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardSection } from "./DashboardSection";
import {
  dashboardCardClass,
  dashboardLabelClass,
  dashboardPrimaryBtnClass,
} from "./dashboard-styles";

type CourseItem = Extract<
  GetStudentCoursesResponse,
  { success: true }
>["data"][number];

function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

function CourseCard({ course }: { course: CourseItem }) {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex items-center justify-between gap-3.5 p-4 transition-colors duration-200 hover:border-[rgba(47,78,64,0.2)]",
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[rgba(47,78,64,0.06)]">
          <BookOpen className="h-[18px] w-[18px] text-(--brand-green)" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-playfair)] text-[0.92rem] font-semibold leading-snug text-(--brand-green)">
            {course.name}
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-medium text-[rgba(47,78,64,0.42)]">
            {formatNPR(course.feeAtEnrollment / 100)} enrolled fee
          </p>
        </div>
      </div>

      <Link
        href={`/courses/${course.slug}`}
        className="shrink-0 p-1.5 text-[rgba(47,78,64,0.3)] transition-colors duration-150 hover:bg-[rgba(47,78,64,0.06)] hover:text-(--brand-green)"
        aria-label={`View ${course.name}`}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </div>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)} />
  );
}

function EnrolledCoursesSkeleton() {
  return (
    <DashboardSection title="Enrolled courses">
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <Shimmer key={i} className="h-[72px]" />
        ))}
      </div>
    </DashboardSection>
  );
}

function EnrolledCoursesError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <DashboardSection title="Enrolled courses">
      <div
        className={cn(
          dashboardCardClass,
          "flex flex-col items-center gap-3 px-5 py-8 text-center",
        )}
      >
        <AlertCircle className="h-5 w-5 text-red-400" strokeWidth={1.75} />
        <div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-semibold text-(--brand-green)">
            Couldn&apos;t load courses
          </p>
          <p className="mx-auto mt-1 max-w-xs font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.5)]">
            {message ?? "Something went wrong fetching your enrolled courses."}
          </p>
        </div>
        <button type="button" onClick={onRetry} className={dashboardPrimaryBtnClass}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Try again
        </button>
      </div>
    </DashboardSection>
  );
}

function EnrolledCoursesEmpty() {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex flex-col items-center gap-3 px-5 py-10 text-center",
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center bg-[#f4f1ec]">
        <GraduationCap className="h-[22px] w-[22px] text-[rgba(47,78,64,0.25)]" strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-playfair)] text-[0.92rem] font-semibold text-[rgba(47,78,64,0.45)]">
          No courses enrolled
        </p>
        <p className="mx-auto mt-1 max-w-[200px] font-[family-name:var(--font-dm-sans)] text-[0.75rem] leading-relaxed text-[rgba(47,78,64,0.35)]">
          Your enrolled courses will appear here once confirmed.
        </p>
      </div>
    </div>
  );
}

export function EnrolledCourses() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["student-courses"],
    queryFn: async () => {
      const res = await api.get<GetStudentCoursesResponse>(
        "/portal/student/courses",
      );
      const parsed = res.data;

      if (!parsed.success) {
        throw new Error(parsed.message ?? "Failed to load courses");
      }

      return parsed.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });

  if (isPending) return <EnrolledCoursesSkeleton />;

  if (isError) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return <EnrolledCoursesError message={message} onRetry={refetch} />;
  }

  return (
    <DashboardSection
      title="Enrolled courses"
      badge={`${data.length} ${data.length === 1 ? "course" : "courses"}`}
    >
      {data.length === 0 ? (
        <EnrolledCoursesEmpty />
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
