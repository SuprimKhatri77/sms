"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
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

export default function CoursesPage() {
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

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
        fee: data.fee,
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
      console.error("error: ", error);
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
    <div className="min-h-screen bg-(--brand-cream) p-8 px-4 font-sans">
      <div className="max-w-240 mx-auto">
        {/* Context */}
        <div className="mb-6 flex items-center gap-1 text-xs text-[rgba(47,78,64,0.45)]">
          <span className="text-[rgba(47,78,64,0.7)]">Admin</span>
          <ChevronRight size={12} />
          <span className="text-[rgba(47,78,64,0.7)]">Courses</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgba(194,138,79,0.14)] text-(--brand-brown)">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-[1.375rem] font-bold tracking-tight text-(--brand-green)">
                Courses
              </h1>
              <p className="mt-[0.15rem] text-[0.8125rem] text-[rgba(47,78,64,0.55)]">
                Manage available courses and their fees
              </p>
            </div>
          </div>
          <button
            className="inline-flex cursor-pointer items-center gap-[0.4rem] whitespace-nowrap rounded-lg border-0 bg-(--brand-green) px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-(--brand-green-2)"
            onClick={() => setModal({ type: "add" })}
          >
            <Plus size={15} /> Add Course
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-5 flex-wrap">
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
            <div
              key={label}
              className="min-w-[120px] flex-1 rounded-lg border border-[rgba(47,78,64,0.14)] bg-white px-4 py-3.5 shadow-sm"
            >
              <div className="text-[1.375rem] font-bold tracking-tight text-(--brand-green)">
                {value}
              </div>
              <div className="mt-[0.2rem] text-[0.72rem] font-semibold tracking-wider text-[rgba(47,78,64,0.45)] uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[rgba(47,78,64,0.4)]"
            />
            <input
              className="w-full rounded-lg border border-[rgba(47,78,64,0.14)] bg-white py-2 pr-3 pl-9 text-sm text-(--brand-green) outline-none transition-all focus:border-(--brand-green) focus:ring-2 focus:ring-[rgba(47,78,64,0.12)]"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-[rgba(47,78,64,0.14)] bg-white p-[0.2rem]">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                className={`px-3 py-[0.3rem] text-[0.78rem] font-medium rounded-[5px] border-0 cursor-pointer transition-all ${
                  filterActive === f
                    ? "bg-(--brand-green) text-white"
                    : "bg-transparent text-[rgba(47,78,64,0.55)] hover:bg-[rgba(47,78,64,0.08)]"
                }`}
                onClick={() => setFilterActive(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-[10px] border border-[rgba(47,78,64,0.14)] bg-white shadow-sm">
          {filtered.length > 0 && (
            <div className="border-b border-[rgba(47,78,64,0.14)] px-4 py-[0.65rem] text-[0.78rem] text-[rgba(47,78,64,0.45)]">
              Showing {filtered.length} of {courses.length} courses
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[rgba(47,78,64,0.14)] bg-[rgba(47,78,64,0.05)]">
                  {["Course Name", "Fee", "Status", "Created", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-[0.7rem] text-left text-[0.6875rem] font-bold tracking-[0.07em] text-[rgba(47,78,64,0.45)] whitespace-nowrap uppercase"
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
                        <Search size={28} className="mx-auto" />
                        <p className="text-sm mt-2">
                          No courses found{search ? ` for "${search}"` : ""}.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-[rgba(47,78,64,0.12)] transition-colors last:border-b-0 hover:bg-[rgba(47,78,64,0.04)]"
                    >
                      <td className="px-4 py-3.5 text-sm font-semibold text-(--brand-green)">
                        {course.name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[0.8125rem] text-[rgba(47,78,64,0.65)]">
                        {formatCurrency(course.fee / 100)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Toggle
                          checked={course.isActive}
                          onChange={(v) =>
                            toggleCourseStatus({ status: v, id: course.id })
                          }
                        />
                      </td>
                      <td className="max-sm:hidden whitespace-nowrap px-4 py-3.5 text-[0.78rem] text-[rgba(47,78,64,0.45)]">
                        {formatDate(String(course.createdAt))}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-[0.4rem]">
                          <button
                            className="grid h-7.5 w-7.5 cursor-pointer place-items-center rounded-md border border-[rgba(47,78,64,0.14)] bg-white text-[rgba(47,78,64,0.55)] transition-all hover:border-(--brand-brown) hover:bg-[rgba(194,138,79,0.12)] hover:text-(--brand-brown)"
                            title="Edit course"
                            onClick={() => {
                              setSelectedCourse(course);
                              setModal({ type: "edit", course });
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-md border border-[rgba(47,78,64,0.14)] bg-white text-[rgba(47,78,64,0.45)] transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600"
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

      {modal?.type === "add" && (
        <CourseFormModal onSave={addCourse} onClose={() => setModal(null)} />
      )}

      {modal?.type === "edit" && (
        <CourseFormModal
          initial={modal.course}
          onSave={(data) => updateCourse({ ...data, id: modal.course.id })}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          courseName={modal.course.name}
          onConfirm={() => deleteCourse(modal.course.id)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
