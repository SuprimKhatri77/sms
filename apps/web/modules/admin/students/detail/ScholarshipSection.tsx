"use client";

import { GraduationCap, Pencil, Trash2 } from "lucide-react";
import { AddBtn } from "./AddButton";
import { SectionCard } from "./shared/SectionCard";
import { DetailEmptyState } from "./shared/DetailEmptyState";
import { detailInsetClass } from "./detail-styles";
import { DeleteScholarshipDialog } from "./DeleteScholarshipDialog";
import { useState } from "react";
import { IconBtn } from "./IconButton";
import { ScholarshipFormModal } from "./ScholarshipFormModal";
import {
  APIError,
  StudentScholarshipInput,
  StudentScholarshipMutationResponse,
  StudentScholarshipResponse,
} from "@repo/types";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { Status } from "./StudentDetail";
import {
  canPerformStudentActions,
  STUDENT_STATUS_ACTION_TOOLTIP,
} from "./student-status-actions";

type Props = {
  studentID: string;
  scholarship: Extract<StudentScholarshipResponse, { success: true }>["data"];
  currentStatus: Status;
};

export function ScholarshipSection({
  scholarship,
  studentID,
  currentStatus,
}: Props) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const router = useRouter();

  const addScholarship = useMutation<
    StudentScholarshipMutationResponse,
    AxiosError<APIError>,
    StudentScholarshipInput
  >({
    mutationFn: async (data: StudentScholarshipInput) => {
      try {
        const res = await api.post<StudentScholarshipMutationResponse>(
          `/admin/students/${studentID}/scholarships`,
          data,
        );

        if (!res.data.success) throw res.data;
        return res.data;
      } catch (error) {
        console.error("error: ", error);
        if (axios.isAxiosError(error)) throw error.response?.data;
        throw error;
      }
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setShowAddModal(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateScholarship = useMutation<
    StudentScholarshipMutationResponse,
    AxiosError<APIError>,
    StudentScholarshipInput
  >({
    mutationFn: async (data: StudentScholarshipInput) => {
      try {
        const res = await api.put<StudentScholarshipMutationResponse>(
          `/admin/students/${studentID}/scholarships/${scholarship.id}`,
          data,
        );

        if (!res.data || !res.data.success) throw res.data;
        return res.data;
      } catch (error) {
        if (axios.isAxiosError<APIError>(error)) {
          throw (
            error.response?.data ?? {
              success: false,
              message: "Something went wrong",
              code: "UNKNOWN_ERROR",
              errors: [],
            }
          );
        }

        throw {
          success: false,
          message: "Unexpected error occurred",
          code: "UNKNOWN_ERROR",
          errors: [],
        };
      }
    },
    onSuccess: (result) => {
      toast.success(result.message);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteScholarship = useMutation({
    mutationFn: async () => {
      const res = await api.delete<StudentScholarshipMutationResponse>(
        `/admin/students/${studentID}/scholarships/${scholarship.id}`,
      );

      if (!res.data || !res.data.success) throw res.data;
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    await deleteScholarship.mutateAsync();
    setShowDeleteDialog(false);
  };

  const handleAdd = async (data: StudentScholarshipInput) => {
    await addScholarship.mutateAsync(data);
    setShowAddModal(false);
  };

  const handleEdit = async (data: StudentScholarshipInput) => {
    if (!scholarship) return;
    await updateScholarship.mutateAsync(data);

    setShowEditModal(false);
  };

  const actionsAllowed = canPerformStudentActions(currentStatus);

  return (
    <SectionCard title="Scholarship" icon={GraduationCap}>
      {showDeleteDialog && (
        <DeleteScholarshipDialog
          onConfirm={handleDelete}
          isPending={deleteScholarship.isPending}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
      {showAddModal && (
        <ScholarshipFormModal
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
          isPending={addScholarship.isPending}
        />
      )}
      {showEditModal && scholarship && (
        <ScholarshipFormModal
          initial={{
            percent: Number(scholarship.percent),
            note: scholarship.note ?? "",
          }}
          onSubmit={handleEdit}
          onCancel={() => setShowEditModal(false)}
          isPending={updateScholarship.isPending}
        />
      )}

      {scholarship ? (
        <div className={`px-4 py-3 ${detailInsetClass}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-lora)] text-2xl font-bold text-(--brand-green)">
                  {scholarship.percent}%
                </span>
                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
                  scholarship
                </span>
              </div>
              <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold tabular-nums text-[#9a3412]">
                −{" "}
                {(scholarship.amount / 100).toLocaleString("en-NP", {
                  style: "currency",
                  currency: "NPR",
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <IconBtn
                icon={Pencil}
                label="Edit"
                onClick={() => setShowEditModal(true)}
                disabled={!actionsAllowed}
                disabledTooltip={STUDENT_STATUS_ACTION_TOOLTIP}
              />
              <IconBtn
                icon={Trash2}
                label="Delete"
                onClick={() => setShowDeleteDialog(true)}
                variant="danger"
                disabled={!actionsAllowed}
                disabledTooltip={STUDENT_STATUS_ACTION_TOOLTIP}
              />
            </div>
          </div>

          {scholarship.note ? (
            <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 font-[family-name:var(--font-dm-sans)] text-xs italic leading-relaxed text-amber-900">
              {scholarship.note}
            </p>
          ) : null}

          <p className="mt-3 font-[family-name:var(--font-dm-sans)] text-[11px] text-[rgba(47,78,64,0.45)]">
            Awarded by{" "}
            <span className="font-semibold text-[rgba(47,78,64,0.65)]">
              {scholarship.addedByName}
            </span>{" "}
            ·{" "}
            {new Date(scholarship.createdAt).toLocaleDateString("en-NP", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      ) : (
        <DetailEmptyState
          icon={GraduationCap}
          message="No scholarship awarded yet."
          action={
            <AddBtn
              label="Award Scholarship"
              onClick={() => setShowAddModal(true)}
              disabled={!actionsAllowed}
              disabledTooltip={STUDENT_STATUS_ACTION_TOOLTIP}
              compact
            />
          }
        />
      )}
    </SectionCard>
  );
}
