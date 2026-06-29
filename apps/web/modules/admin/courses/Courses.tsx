"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import {
  APIResponse,
  CoursesListResponse,
  CreateCourseResponse,
  DeleteCourse,
  ToggleCourse,
  UpdateCourse,
  UpdateCourseResponse,
} from "@repo/types";
import { Toggle } from "./Toggle";
import { CourseFormModal } from "./CourseFormModal";
import { DeleteConfirmModal } from "./DeleteFormModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateCourse } from "@repo/types";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CoursesLoading } from "./CoursesLoadingSkeleton";
import { CoursesError } from "./CoursesError";
import { CoursesUnavailable } from "./CoursesUnavailable";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { ADMIN_DRAWER_CLOSE_MS } from "@/components/admin/admin-drawer";
import {
  adminIconButtonClass,
  adminDangerIconButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSegmentActiveClass,
  adminSegmentInactiveClass,
  adminTableClass,
  adminTableScrollClass,
} from "@/components/admin/admin-styles";

export type Course = Extract<
  CoursesListResponse,
  { success: true }
>["data"][number];

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-NP")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Modal =
  | { type: "add" }
  | {
      type: "edit";
      course: Course;
    }
  | {
      type: "delete";
      course: Course;
    }
  | null;

type CourseDrawerState =
  | { type: "add" }
  | { type: "edit"; course: Course }
  | null;

export default function CoursesPage() {
  const [modal, setModal] = useState<Modal>(null);
  const [courseDrawer, setCourseDrawer] = useState<CourseDrawerState>(null);
  const [courseDrawerOpen, setCourseDrawerOpen] = useState(false);
  const courseDrawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const openCourseDrawer = (next: Extract<Modal, { type: "add" | "edit" }>) => {
    if (courseDrawerCloseTimerRef.current) {
      clearTimeout(courseDrawerCloseTimerRef.current);
      courseDrawerCloseTimerRef.current = null;
    }
    setCourseDrawer(next);
    setCourseDrawerOpen(true);
  };

  const handleCourseDrawerOpenChange = (open: boolean) => {
    if (open) {
      setCourseDrawerOpen(true);
      return;
    }

    setCourseDrawerOpen(false);
    if (courseDrawerCloseTimerRef.current) {
      clearTimeout(courseDrawerCloseTimerRef.current);
    }
    courseDrawerCloseTimerRef.current = setTimeout(() => {
      setCourseDrawer(null);
      courseDrawerCloseTimerRef.current = null;
    }, ADMIN_DRAWER_CLOSE_MS);
  };

  useEffect(() => {
    return () => {
      if (courseDrawerCloseTimerRef.current) {
        clearTimeout(courseDrawerCloseTimerRef.current);
      }
    };
  }, []);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const res = await api.get<CoursesListResponse>("/admin/courses");
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { mutate: addCourse } = useMutation({
    mutationFn: async (data: CreateCourse) => {
      const res = await api.post<CreateCourseResponse>("/admin/courses", data);
      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      return res.data;
    },
    onMutate: async (data: CreateCourse) => {
      await queryClient.cancelQueries({ queryKey: ["admin-courses"] });

      const previousCourses = queryClient.getQueryData<CoursesListResponse>([
        "admin-courses",
      ]);

      const optimisticCourse: Course = {
        id: crypto.randomUUID(),
        name: data.name,
        fee: data.fee * 100,
        isActive: data.isActive,
        createdAt: new Date(),
      };

      queryClient.setQueryData<CoursesListResponse>(
        ["admin-courses"],
        (old) => {
          if (!old || !old.success) return old;

          return {
            ...old,
            data: [...old.data, optimisticCourse],
          };
        },
      );

      return { previousCourses, optimisticCourse };
    },
    onSuccess: (result, _, context) => {
      toast.success(result.message);

      queryClient.setQueryData<CoursesListResponse>(
        ["admin-courses"],
        (old) => {
          if (!old || !old.success) return old;

          return {
            ...old,
            data: old.data.map((c) =>
              c.id === context.optimisticCourse.id ? result.data : c,
            ),
          };
        },
      );
    },
    onError: (error, _, context) => {
      toast.error(error.message);

      if (context?.previousCourses) {
        queryClient.setQueryData(["admin-courses"], context.previousCourses);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-courses"],
      });
    },
  });
  const { mutate: updateCourse } = useMutation({
    mutationFn: async ({ fee, isActive, name, id }: UpdateCourse) => {
      const res = await api.put<UpdateCourseResponse>(`/admin/courses/${id}`, {
        fee,
        isActive,
        name,
      });
      if (!res.data.success) throw new Error(res.data.message);
      return res.data;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["admin-courses"] });
      const previousCourses = queryClient.getQueryData(["admin-courses"]);

      const optimisticCourse: Course = {
        id: data.id,
        name: data.name,
        isActive: data.isActive,
        fee: data.fee * 100,
        createdAt: selectedCourse!.createdAt,
      };
      queryClient.setQueryData<CoursesListResponse>(
        ["admin-courses"],
        (old) => {
          if (!old || !old.success) return old;
          return {
            ...old,
            data: old.data.map((c) =>
              c.id === selectedCourse?.id ? optimisticCourse : c,
            ),
          };
        },
      );

      return { previousCourses, optimisticCourse };
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error, _, context) => {
      toast.error(error.message);
      if (context?.previousCourses) {
        queryClient.setQueryData(["admin-courses"], context.previousCourses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });
  const { mutate: deleteCourse } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<DeleteCourse>(`/admin/courses/${id}`);
      if (!res.data.success) throw new Error(res.data.message);
      return res.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["admin-courses"] });
      const previousCourses = queryClient.getQueryData(["admin-courses"]);

      queryClient.setQueryData<CoursesListResponse>(
        ["admin-courses"],
        (old) => {
          if (!old || !old.success) return old;

          return {
            ...old,
            data: old.data.filter((c) => c.id != id),
          };
        },
      );
      return { previousCourses };
    },
    onSuccess: (result) => {
      setSelectedCourse(null);
      toast.success(result.message);
      router.refresh();
    },
    onError: (error, _, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(["admin-courses"], context.previousCourses);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  const { mutate: toggleCourseStatus } = useMutation({
    mutationFn: async ({ status, id }: ToggleCourse) => {
      const res = await api.patch<APIResponse>(`/admin/courses/${id}`, {
        isActive: status,
      });
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-courses"] });

      const previousCourses = queryClient.getQueryData<CoursesListResponse>([
        "admin-courses",
      ]);

      queryClient.setQueryData<CoursesListResponse>(
        ["admin-courses"],
        (old) => {
          if (!old || !old.success) return old;

          return {
            ...old,
            data: old.data.map((c) =>
              c.id === id ? { ...c, isActive: status } : c,
            ),
          };
        },
      );
      return { previousCourses };
    },
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error, _, context) => {
      // console.error("error: ", error);
      if (context?.previousCourses) {
        queryClient.setQueryData(["admin-courses"], context.previousCourses);
      }

      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  if (isPending) {
    return <CoursesLoading />;
  }

  if (isError) {
    return <CoursesError onRetry={refetch} />;
  }

  if (!data || !data.success) {
    return <CoursesUnavailable message={data.message} onRetry={refetch} />;
  }

  const courses = data.data;

  const filtered = courses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterActive === "all" ||
      (filterActive === "active" && c.isActive) ||
      (filterActive === "inactive" && !c.isActive);
    return matchSearch && matchFilter;
  });

  return (
    <AdminPageLayout
      title="Courses"
      description="Manage available courses and their fees"
      maxWidth="wide"
      action={
        <button
          className={adminPrimaryButtonClass}
          onClick={() => openCourseDrawer({ type: "add" })}
        >
          <Plus size={15} /> Add Course
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 divide-y divide-[rgba(47,78,64,0.12)] border border-[rgba(47,78,64,0.18)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { value: courses.length, label: "Total" },
            {
              value: courses.filter((c) => c.isActive).length,
              label: "Active",
            },
            {
              value: courses.filter((c) => !c.isActive).length,
              label: "Inactive",
            },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white px-5 py-4">
              <p className="font-[family-name:var(--font-lora)] text-2xl font-bold tracking-tight text-(--brand-green)">
                {value}
              </p>
              <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-45 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[rgba(47,78,64,0.4)]"
            />
            <input
              className={`${adminInputClass} py-2.5 pr-3 pl-9`}
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.08)] p-px">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                className={`cursor-pointer px-3 py-2 font-[family-name:var(--font-dm-sans)] text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${
                  filterActive === f
                    ? adminSegmentActiveClass
                    : adminSegmentInactiveClass
                }`}
                onClick={() => setFilterActive(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
          {filtered.length > 0 && (
            <div className="border-b border-[rgba(47,78,64,0.12)] px-4 py-3 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
              Showing {filtered.length} of {courses.length} courses
            </div>
          )}
          <div className={adminTableScrollClass}>
            <table className={adminTableClass}>
              <thead>
                <tr className="border-b border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)]">
                  {["Course Name", "Fee", "Status", "Created", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-[family-name:var(--font-dm-sans)] text-[10px] font-bold tracking-[0.1em] whitespace-nowrap text-[rgba(47,78,64,0.45)] uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="px-6 py-14 text-center text-[rgba(47,78,64,0.45)]">
                        <BookOpen size={28} className="mx-auto opacity-40" />
                        <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-sm">
                          No courses found{search ? ` for "${search}"` : ""}.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-[rgba(47,78,64,0.08)] transition-colors last:border-b-0 hover:bg-[rgba(47,78,64,0.02)]"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-green)">
                        {course.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-sm text-[rgba(47,78,64,0.65)]">
                        {formatCurrency(course.fee / 100)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <Toggle
                          checked={course.isActive}
                          onChange={(v) =>
                            toggleCourseStatus({ status: v, id: course.id })
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 font-[family-name:var(--font-dm-sans)] text-xs whitespace-nowrap text-[rgba(47,78,64,0.45)]">
                        {formatDate(String(course.createdAt))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            className={adminIconButtonClass}
                            title="Edit course"
                            onClick={() => {
                              setSelectedCourse(course);
                              openCourseDrawer({ type: "edit", course });
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className={adminDangerIconButtonClass}
                            title="Delete course"
                            onClick={() => {
                              setSelectedCourse(course);
                              setModal({ type: "delete", course });
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CourseFormModal
        open={courseDrawerOpen && courseDrawer !== null}
        initial={courseDrawer?.type === "edit" ? courseDrawer.course : undefined}
        onSave={
          courseDrawer?.type === "edit"
            ? (data) => updateCourse({ ...data, id: courseDrawer.course.id })
            : addCourse
        }
        onOpenChange={handleCourseDrawerOpenChange}
      />

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          courseName={modal.course.name}
          onConfirm={() => deleteCourse(modal.course.id)}
          onClose={() => setModal(null)}
        />
      )}
    </AdminPageLayout>
  );
}
