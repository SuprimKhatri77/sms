"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronRight,
  Search,
  AlertTriangle,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  fee: number;
  is_active: boolean;
  created_at: string;
}

function genId(): string {
  return crypto.randomUUID();
}

const INITIAL_COURSES: Course[] = [
  {
    id: genId(),
    name: "Bachelor of Computer Science",
    fee: 45000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: genId(),
    name: "Diploma in Business Administration",
    fee: 28000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: genId(),
    name: "Certificate in Digital Marketing",
    fee: 12000,
    is_active: false,
    created_at: new Date().toISOString(),
  },
];

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

// ─── Toggle ─────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full border-0 cursor-pointer transition-colors duration-200 flex-shrink-0 p-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      {/* Tailwind can't handle dynamic `left` values for the thumb, so inline style is necessary here */}
      <span
        className="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-all duration-200 shadow-sm"
        style={{ left: checked ? "20px" : "2px" }}
      />
    </button>
  );
}

// ─── Course Form Modal ───────────────────────────────────────────────────────

interface CourseFormProps {
  initial?: Course;
  onSave: (data: Omit<Course, "id" | "created_at">) => void;
  onClose: () => void;
}

function CourseFormModal({ initial, onSave, onClose }: CourseFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [fee, setFee] = useState(initial?.fee.toString() ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Course name is required.";
    if (!fee.trim() || isNaN(Number(fee)) || Number(fee) < 0)
      errs.fee = "Enter a valid fee amount.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ name: name.trim(), fee: Number(fee), is_active: isActive });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/35 grid place-items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[440px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 justify-between px-5 py-[1.1rem] border-b border-gray-200">
          <h2 className="text-base font-bold flex-1">
            {initial ? "Edit Course" : "Add Course"}
          </h2>
          <button
            className="w-[30px] h-[30px] rounded-md border border-gray-200 grid place-items-center cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">
          <label className="flex flex-col gap-[0.35rem] text-[0.8rem] font-semibold text-gray-500">
            Course Name
            <input
              className={`border-[1.5px] rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-900 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="e.g. Bachelor of Science"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: "" }));
              }}
            />
            {errors.name && (
              <span className="text-[0.75rem] text-red-600">{errors.name}</span>
            )}
          </label>

          <label className="flex flex-col gap-[0.35rem] text-[0.8rem] font-semibold text-gray-500">
            Fee (NPR)
            <input
              className={`border-[1.5px] rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-900 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 ${
                errors.fee ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="e.g. 45000"
              type="number"
              min={0}
              value={fee}
              onChange={(e) => {
                setFee(e.target.value);
                setErrors((p) => ({ ...p, fee: "" }));
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {errors.fee && (
              <span className="text-[0.75rem] text-red-600">{errors.fee}</span>
            )}
          </label>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Active</p>
              <p className="text-[0.75rem] text-gray-400 mt-[0.15rem]">
                Inactive courses won&apos;t appear for enrollment
              </p>
            </div>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            className="inline-flex items-center gap-[0.4rem] bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 text-[0.8125rem] font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-[0.4rem] bg-blue-600 text-white border-0 rounded-lg px-4 py-2 text-[0.8125rem] font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
            onClick={handleSubmit}
          >
            <Save size={15} />
            {initial ? "Update" : "Add Course"}
          </button>
        </div>
      </div>

      {/* Animations — Tailwind's animate-* don't cover custom keyframes, so these stay as a style tag */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-up { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
        .animate-fade-in { animation: fade-in .15s ease; }
        .animate-slide-up { animation: slide-up .18s ease; }
      `}</style>
    </div>
  );
}

// ─── Delete Confirm ──────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  courseName: string;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteConfirmModal({
  courseName,
  onConfirm,
  onClose,
}: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/35 grid place-items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[380px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 justify-between px-5 py-[1.1rem] border-b border-gray-200">
          <div className="text-red-600">
            <AlertTriangle size={18} />
          </div>
          <h2 className="text-base font-bold flex-1">Delete Course</h2>
          <button
            className="w-[30px] h-[30px] rounded-md border border-gray-200 grid place-items-center cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-gray-500">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900">{courseName}</strong>? This action
            cannot be undone.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            className="inline-flex items-center gap-[0.4rem] bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 text-[0.8125rem] font-medium cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-[0.4rem] bg-red-600 text-white border-0 rounded-lg px-4 py-2 text-[0.8125rem] font-semibold cursor-pointer hover:bg-red-700 transition-colors"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-up { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
        .animate-fade-in { animation: fade-in .15s ease; }
        .animate-slide-up { animation: slide-up .18s ease; }
      `}</style>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type Modal =
  | { type: "add" }
  | { type: "edit"; course: Course }
  | { type: "delete"; course: Course }
  | null;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filtered = courses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterActive === "all" ||
      (filterActive === "active" && c.is_active) ||
      (filterActive === "inactive" && !c.is_active);
    return matchSearch && matchFilter;
  });

  const handleAdd = (data: Omit<Course, "id" | "created_at">) => {
    setCourses((prev) => [
      { ...data, id: genId(), created_at: new Date().toISOString() },
      ...prev,
    ]);
  };

  const handleEdit = (id: string, data: Omit<Course, "id" | "created_at">) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
  };

  const handleDelete = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleActive = (id: string, value: boolean) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: value } : c)),
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f4f2] p-8 px-4 font-sans">
      <div className="max-w-[960px] mx-auto">
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
              value: courses.filter((c) => c.is_active).length,
              label: "Active",
            },
            {
              value: courses.filter((c) => !c.is_active).length,
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
                        {formatCurrency(course.fee)}
                      </td>
                      <td className="px-4 py-[0.875rem]">
                        <Toggle
                          checked={course.is_active}
                          onChange={(v) => handleToggleActive(course.id, v)}
                        />
                      </td>
                      <td className="px-4 py-[0.875rem] text-[0.78rem] text-gray-400 whitespace-nowrap max-sm:hidden">
                        {formatDate(course.created_at)}
                      </td>
                      <td className="px-4 py-[0.875rem]">
                        <div className="flex items-center gap-[0.4rem]">
                          <button
                            className="w-[30px] h-[30px] rounded-md border border-gray-200 grid place-items-center cursor-pointer transition-all bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                            title="Edit course"
                            onClick={() => setModal({ type: "edit", course })}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="w-[30px] h-[30px] rounded-md border border-gray-200 grid place-items-center cursor-pointer transition-all bg-white text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                            title="Delete course"
                            onClick={() => setModal({ type: "delete", course })}
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
        <CourseFormModal onSave={handleAdd} onClose={() => setModal(null)} />
      )}

      {modal?.type === "edit" && (
        <CourseFormModal
          initial={modal.course}
          onSave={(data) => handleEdit(modal.course.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          courseName={modal.course.name}
          onConfirm={() => handleDelete(modal.course.id)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
