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
    <div className="min-h-screen bg-[#f5f4f2] p-8 px-4 font-sans">
      <div className="max-w-240 mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-6">
          <span className="text-gray-500">Admin</span>
          <ChevronRight size={12} />
          <span className="text-gray-500">Courses</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg grid place-items-center text-blue-600 flex-shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-[1.375rem] font-bold tracking-tight">
                Courses
              </h1>
              <p className="text-[0.8125rem] text-gray-500 mt-[0.15rem]">
                Manage available courses and their fees
              </p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-[0.4rem] bg-blue-600 text-white border-0 rounded-lg px-4 py-2 text-[0.8125rem] font-semibold cursor-pointer hover:bg-blue-700 transition-colors whitespace-nowrap"
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
              className="flex-1 min-w-[120px] bg-white border border-gray-200 rounded-lg px-4 py-[0.875rem] shadow-sm"
            >
              <div className="text-[1.375rem] font-bold tracking-tight">
                {value}
              </div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-400 mt-[0.2rem]">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-[0.625rem] mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              className="w-full py-2 pr-3 pl-9 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-[0.2rem]">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                className={`px-3 py-[0.3rem] text-[0.78rem] font-medium rounded-[5px] border-0 cursor-pointer transition-all ${
                  filterActive === f
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setFilterActive(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-200 rounded-[10px] shadow-sm overflow-hidden">
          {filtered.length > 0 && (
            <div className="text-[0.78rem] text-gray-400 px-4 py-[0.65rem] border-b border-gray-200">
              Showing {filtered.length} of {courses.length} courses
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f5f4f2] border-b border-gray-200">
                  {["Course Name", "Fee", "Status", "Created", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-[0.7rem] text-left text-[0.6875rem] font-bold uppercase tracking-[0.07em] text-gray-400 whitespace-nowrap"
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
                      <div className="py-14 px-6 text-center text-gray-400">
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
                      className="border-b border-gray-200 last:border-b-0 hover:bg-[#f5f4f2] transition-colors"
                    >
                      <td className="px-4 py-[0.875rem] text-sm font-semibold text-gray-900">
                        {course.name}
                      </td>
                      <td className="px-4 py-[0.875rem] text-[0.8125rem] text-gray-500 font-mono">
                        {formatCurrency(course.fee / 100)}
                      </td>
                      <td className="px-4 py-[0.875rem]">
                        <Toggle
                          checked={course.isActive}
                          onChange={(v) =>
                            toggleCourseStatus({ status: v, id: course.id })
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 text-[0.78rem] text-gray-400 whitespace-nowrap max-sm:hidden">
                        {formatDate(String(course.createdAt))}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-[0.4rem]">
                          <button
                            className="w-7.5 h-7.5 rounded-md border border-gray-200 grid place-items-center cursor-pointer transition-all bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                            title="Edit course"
                            onClick={() => {
                              setSelectedCourse(course);
                              setModal({ type: "edit", course });
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="w-[30px] h-[30px] rounded-md border border-gray-200 grid place-items-center cursor-pointer transition-all bg-white text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
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
