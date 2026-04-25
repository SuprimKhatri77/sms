"use client";

import { useState } from "react";
import { Course } from "./Courses";
import { Save, X } from "lucide-react";
import { Toggle } from "./Toggle";
import { createCourseSchema } from "@repo/types";
import z from "zod";

interface CourseFormProps {
  initial?: Course;
  onSave: (data: Omit<Course, "id" | "createdAt">) => void;
  onClose: () => void;
}

type CourseFormErrors = {
  name?: string;
  fee?: string;
  isActive?: string;
};

export function CourseFormModal({ initial, onSave, onClose }: CourseFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [fee, setFee] = useState(
    initial?.fee != null ? (initial.fee / 100).toString() : "",
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<CourseFormErrors>({});

  const handleSubmit = () => {
    const validateFields = createCourseSchema.safeParse({
      name,
      fee: Number(fee),
      isActive,
    });
    if (!validateFields.success) {
      const tree = z.treeifyError(validateFields.error).properties;
      setErrors({
        name: tree?.name?.errors[0],
        fee: tree?.fee?.errors[0],
        isActive: tree?.isActive?.errors[0],
      });
      return;
    }
    onSave({ ...validateFields.data });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/35 grid place-items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-110 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 justify-between px-5 py-[1.1rem] border-b border-gray-200">
          <h2 className="text-base font-bold flex-1">
            {initial ? "Edit Course" : "Add Course"}
          </h2>
          <button
            className="w-7.5 h-7.5 rounded-md border border-gray-200 grid place-items-center cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors"
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

      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-up { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
        .animate-fade-in { animation: fade-in .15s ease; }
        .animate-slide-up { animation: slide-up .18s ease; }
      `}</style>
    </div>
  );
}
