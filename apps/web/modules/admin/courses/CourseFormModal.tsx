"use client";

import { useEffect, useState } from "react";
import { Course } from "./Courses";
import { Save } from "lucide-react";
import { Toggle } from "./Toggle";
import { createCourseSchema } from "@repo/types";
import z from "zod";
import {
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  AdminDrawer,
  adminFieldErrorClass,
  adminFieldLabelClass,
} from "@/components/admin/admin-drawer";
import { cn } from "@/lib/utils";
import { COURSE_PRICE_VAT_NOTE } from "@/components/courses/course-styles";

interface CourseFormProps {
  open: boolean;
  initial?: Course;
  onSave: (data: Omit<Course, "id" | "createdAt">) => void;
  onOpenChange: (open: boolean) => void;
}

type CourseFormErrors = {
  name?: string;
  fee?: string;
  isActive?: string;
};

export function CourseFormModal({
  open,
  initial,
  onSave,
  onOpenChange,
}: CourseFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [fee, setFee] = useState(
    initial?.fee != null ? (initial.fee / 100).toString() : "",
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<CourseFormErrors>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setFee(initial?.fee != null ? (initial.fee / 100).toString() : "");
    setIsActive(initial?.isActive ?? true);
    setErrors({});
  }, [open, initial]);

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
    onOpenChange(false);
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Edit Course" : "Add Course"}
      description={
        initial
          ? "Update course details and fee"
          : "Create a new course with name and fee"
      }
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={adminSecondaryButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={adminPrimaryButtonClass}
            onClick={handleSubmit}
          >
            <Save size={15} />
            {initial ? "Update" : "Add Course"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-5 py-5">
        <label className={adminFieldLabelClass}>
          Course Name
          <input
            className={cn(
              adminInputClass,
              "normal-case tracking-normal",
              errors.name && "border-[#9a3412]",
            )}
            placeholder="e.g. Bachelor of Science"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: "" }));
            }}
          />
          {errors.name ? (
            <span className={adminFieldErrorClass}>{errors.name}</span>
          ) : null}
        </label>

        <label className={adminFieldLabelClass}>
          Fee (NPR)
          <input
            className={cn(
              adminInputClass,
              "normal-case tracking-normal",
              errors.fee && "border-[#9a3412]",
            )}
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
          {errors.fee ? (
            <span className={adminFieldErrorClass}>{errors.fee}</span>
          ) : (
            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.45)]">
              {COURSE_PRICE_VAT_NOTE}
            </span>
          )}
        </label>

        <div className="flex items-center justify-between gap-4 border border-[rgba(47,78,64,0.12)] bg-white px-4 py-3">
          <div>
            <p className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
              Active
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
              Inactive courses won&apos;t appear for enrollment
            </p>
          </div>
          <Toggle checked={isActive} onChange={setIsActive} />
        </div>
      </div>
    </AdminDrawer>
  );
}
