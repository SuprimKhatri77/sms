"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { BookOpen, Check } from "lucide-react";
import { toast } from "sonner";
import {
  APIError,
  ChangeStudentCourses,
  ChangeStudentCoursesResponse,
  CoursesList,
  StudentEnrolledCourses,
} from "@repo/types";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { ModalShell } from "./shared/ModalShell";
import { detailLabelClass, detailValueClass } from "./detail-styles";
import { formatNpr } from "../shared/student-utils";

type EnrolledCourse = Extract<
  StudentEnrolledCourses,
  { success: true }
>["data"][number];

type CourseOption = {
  id: string;
  name: string;
  // paisa: the enrolled fee for a course they already have, otherwise the current fee
  fee: number;
  inactive: boolean;
};

export function ChangeCoursesModal({
  studentId,
  currentCourses,
  onClose,
}: {
  studentId: string;
  currentCourses: EnrolledCourse[];
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState(() =>
    currentCourses.map((course) => course.id),
  );

  const {
    data: activeCourses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.courses.active,
    queryFn: async () => {
      const res = await api.get<CoursesList>("/courses");
      if (!res.data.success) throw new Error(res.data.message);
      return res.data.data;
    },
    // fees and active courses can change on the admin courses page
    staleTime: 0,
  });

  const { mutate, isPending } = useMutation<
    ChangeStudentCoursesResponse,
    AxiosError<APIError>,
    ChangeStudentCourses
  >({
    mutationFn: async (data) => {
      const res = await api.put<ChangeStudentCoursesResponse>(
        `/admin/students/${studentId}/courses`,
        data,
      );
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      router.refresh();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Failed to change course");
      // a 409 means the student's records changed since this page loaded
      if (error.response?.status === 409) {
        router.refresh();
        onClose();
        return;
      }
      // a course may have been deactivated or removed since the list loaded
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.active });
    },
  });

  const enrolledOptions: CourseOption[] = currentCourses.map((course) => ({
    id: course.id,
    name: course.name,
    fee: course.feeAtEnrollment,
    inactive: !course.isActive,
  }));
  const options: CourseOption[] = [
    ...enrolledOptions,
    ...(activeCourses ?? [])
      .filter((course) => !currentCourses.some((c) => c.id === course.id))
      .map((course) => ({ ...course, inactive: false })),
  ];

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const hasChanges =
    selectedIds.length !== currentCourses.length ||
    selectedIds.some((id) => !currentCourses.some((c) => c.id === id));

  const currentTotal = currentCourses.reduce(
    (sum, course) => sum + course.feeAtEnrollment,
    0,
  );
  const newTotal = options
    .filter((option) => selectedIds.includes(option.id))
    .reduce((sum, option) => sum + option.fee, 0);

  return (
    <ModalShell
      title="Change Course"
      icon={BookOpen}
      onCancel={() => {
        if (!isPending) onClose();
      }}
      onSubmit={() => mutate({ courseIds: selectedIds })}
      submitLabel="Save Changes"
      submitting={isPending}
      submitDisabled={isLoading || isError || !selectedIds.length || !hasChanges}
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : isError ? (
        <p
          role="alert"
          className="font-(family-name:--font-dm-sans) text-sm text-[#9a3412]"
        >
          Could not load the course list. Please close this and try again.
        </p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Courses"
            className="flex max-h-72 flex-col gap-2 overflow-y-auto"
          >
            {options.map((option) => {
              const selected = selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggle(option.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-(--brand-green) bg-[rgba(47,78,64,0.05)]"
                      : "border-[rgba(47,78,64,0.12)] hover:border-[rgba(47,78,64,0.3)]",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center border",
                        selected
                          ? "border-(--brand-green) bg-(--brand-green) text-white"
                          : "border-[rgba(47,78,64,0.3)]",
                      )}
                    >
                      {selected ? <Check size={12} strokeWidth={3} /> : null}
                    </span>
                    <span className={detailValueClass}>
                      {option.name}
                      {option.inactive ? " (inactive)" : ""}
                    </span>
                  </span>
                  <span className="font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums text-(--brand-green)">
                    {formatNpr(option.fee / 100)}
                  </span>
                </button>
              );
            })}
          </div>

          {!selectedIds.length ? (
            <p
              role="alert"
              className="font-(family-name:--font-dm-sans) text-xs text-[#9a3412]"
            >
              Please select at least one course.
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-[rgba(47,78,64,0.12)] pt-3">
            <span className={detailLabelClass}>Total fee</span>
            <span className="font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums text-(--brand-green)">
              {formatNpr(currentTotal / 100)} → {formatNpr(newTotal / 100)}
            </span>
          </div>
        </>
      )}
    </ModalShell>
  );
}
