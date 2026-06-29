"use client";

import { useState } from "react";
import { SectionCard } from "./shared/SectionCard";
import { EditToolbar } from "./shared/EditToolBar";
import {
  BaseErrorResponse,
  StudentDetail,
  updateStudentGuardianInfoInputSchema,
} from "@repo/types";
import { EditIconBtn } from "./shared/EditIconButton";
import { EditField } from "./shared/EditField";
import { inputCls } from "./shared/utils";
import { InfoRow } from "./InfoRow";
import { Phone, User, Users } from "lucide-react";
import z from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  UpdateStudentGuardianInfoInput,
  UpdateStudentInfoResponse,
} from "@repo/types/admin/students/personal-info";
import api from "@/lib/axios";
import { toast } from "sonner";
import axios from "axios";
import { mapFieldErrors } from "@/utils/api";
import { FieldError } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import type { Status } from "./StudentDetail";
import {
  canPerformStudentActions,
  STUDENT_STATUS_ACTION_TOOLTIP,
} from "./student-status-actions";

type Student = Extract<StudentDetail, { success: true }>["data"];

type GuardianForm = {
  guardianName: string;
  guardianPhone: string;
};
export function GuardianSection({
  student,
  currentStatus,
}: {
  student: Student;
  currentStatus: Status;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<GuardianForm>({
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
  });
  const [errors, setErrors] =
    useState<Partial<Record<keyof GuardianForm, string>>>();
  const router = useRouter();

  const set =
    <K extends keyof GuardianForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const { mutateAsync } = useMutation({
    mutationFn: async (data: UpdateStudentGuardianInfoInput) => {
      const res = await api.put<UpdateStudentInfoResponse>(
        `/admin/students/${student.id}/info/guardian`,
        data,
      );
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      router.refresh();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as BaseErrorResponse;
        if (data.errors) {
          setErrors(mapFieldErrors(data));
        }
      }
      toast.error(error.message);
    },
  });

  const handleSave = async () => {
    setSaving(true);
    const validateFields = updateStudentGuardianInfoInputSchema.safeParse(form);
    if (!validateFields.success) {
      setSaving(false);
      const tree = z.treeifyError(validateFields.error).properties;
      setErrors({
        guardianName: tree?.guardianName?.errors[0],
        guardianPhone: tree?.guardianPhone?.errors[0],
      });
      return;
    }
    try {
      await mutateAsync(form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
    });
    setEditing(false);
  };

  const actionsAllowed = canPerformStudentActions(currentStatus);

  return (
    <SectionCard
      title="Guardian Information"
      icon={Users}
      action={
        editing ? (
          <EditToolbar
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        ) : (
          <EditIconBtn
            onClick={() => setEditing(true)}
            disabled={!actionsAllowed}
            disabledTooltip={STUDENT_STATUS_ACTION_TOOLTIP}
          />
        )
      }
    >
      {editing ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditField label="Guardian Name">
            <input
              className={inputCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.guardianName}
              onChange={set("guardianName")}
              placeholder="Guardian's full name"
              autoFocus
            />
            {errors?.guardianName && (
              <FieldError>{errors.guardianName}</FieldError>
            )}
          </EditField>

          <EditField label="Guardian Phone">
            <input
              className={inputCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.guardianPhone}
              onChange={set("guardianPhone")}
              placeholder="Guardian's phone number"
            />
            {errors?.guardianPhone && (
              <FieldError>{errors.guardianPhone}</FieldError>
            )}
          </EditField>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow
            label="Guardian Name"
            value={student.guardianName}
            icon={User}
          />
          <InfoRow
            label="Guardian Phone"
            value={student.guardianPhone}
            icon={Phone}
          />
        </div>
      )}
    </SectionCard>
  );
}
