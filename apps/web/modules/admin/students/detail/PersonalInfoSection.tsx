"use client";

import { useState } from "react";
import { SectionCard } from "./shared/SectionCard";
import { EditToolbar } from "./shared/EditToolBar";
import { EditIconBtn } from "./shared/EditIconButton";
import { cn } from "@/lib/utils";
import { detailLabelClass } from "./detail-styles";
import {
  APIError,
  APIResponse,
  StudentDetail,
  updateStudentPersonalInfoInputSchema,
} from "@repo/types";
import {
  CalendarDays,
  Clock,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { inputCls, selectCls } from "./shared/utils";
import { InfoRow } from "./InfoRow";
import z from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  UpdateStudentPersonalInfo,
  UpdateStudentInfoResponse,
} from "@repo/types/admin/students/personal-info";
import api from "@/lib/axios";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { mapFieldErrors } from "@/utils/api";
import { FieldError } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import "nepali-datepicker-reactjs/dist/index.css";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { BSToAD } from "bikram-sambat-js";
import getMonth from "nepali-date-converter";
import type { Status } from "./StudentDetail";
import {
  canPerformStudentActions,
  STUDENT_STATUS_ACTION_TOOLTIP,
} from "./student-status-actions";

type Student = Extract<StudentDetail, { success: true }>["data"];

type PersonalInfoForm = {
  fullName: string;
  dobAd: string;
  dobBs: string;
  gender: "male" | "female" | "other";
  phone: string;
  source: "facebook" | "instagram" | "tiktok" | "referral" | "inperson";
  shift: "morning" | "day" | "evening";
  shiftTime: string;
  address: string;
  batch: string;
};

function EditField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className={detailLabelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

const shiftTimeMap: Record<string, string> = {
  morning: "8:00–10:00 AM",
  day: "11:00 AM–1:00 PM",
  evening: "6:00–8:00 PM",
};

export function PersonalInfoSection({
  student,
  currentStatus,
}: {
  student: Student;
  currentStatus: Status;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PersonalInfoForm>({
    fullName: student.fullName,
    dobAd: new Date(student.dobAd).toISOString().split("T")[0],
    dobBs: student.dobBs ?? "",
    gender: student.gender,
    phone: student.phone,
    source: student.source,
    shift: student.shift,
    shiftTime: student.shiftTime ?? "",
    address: student.address,
    batch: student?.batch ?? "",
  });
  const [errors, setErrors] =
    useState<Partial<Record<keyof PersonalInfoForm, string>>>();
  const router = useRouter();
  const isPhoneValid = /^(98|97)\d{8}$/.test(form.phone);

  const set =
    <K extends keyof PersonalInfoForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const { mutateAsync } = useMutation<
    UpdateStudentInfoResponse,
    AxiosError<APIError>,
    UpdateStudentPersonalInfo
  >({
    mutationFn: async (data: UpdateStudentPersonalInfo) => {
      const res = await api.put(
        `/admin/students/${student.id}/info/personal`,
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
        const data = error.response?.data as APIResponse;
        if (data.errors) {
          setErrors(mapFieldErrors(data));
        }
      }
      toast.error(error.message);
    },
  });

  const handleSave = async () => {
    setSaving(true);
    console.log("batch: ", form.batch);
    const validateFields = updateStudentPersonalInfoInputSchema.safeParse(form);
    if (!validateFields.success) {
      setSaving(false);
      const tree = z.treeifyError(validateFields.error).properties;
      console.log("error: ", tree);
      setErrors({
        fullName: tree?.fullName?.errors[0],
        dobAd: tree?.dobAd?.errors[0],
        dobBs: tree?.dobBs?.errors[0],
        gender: tree?.gender?.errors[0],
        phone: tree?.phone?.errors[0],
        shift: tree?.shift?.errors[0],
        shiftTime: tree?.shiftTime?.errors[0],
        address: tree?.address?.errors[0],
        batch: tree?.batch?.errors[0],
        source: tree?.source?.errors[0],
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
      fullName: student.fullName,
      dobAd: new Date(student.dobAd).toISOString().split("T")[0],
      dobBs: student.dobBs ?? "",
      gender: student.gender,
      phone: student.phone,
      source: student.source,
      shift: student.shift ?? "",
      shiftTime: student.shiftTime ?? "",
      address: student.address,
      batch: student.batch ?? "",
    });
    setErrors({});
    setEditing(false);
  };

  const actionsAllowed = canPerformStudentActions(currentStatus);

  return (
    <SectionCard
      title="Personal Information"
      icon={User}
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <EditField label="Full Name">
            <input
              className={inputCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="Full name"
            />
            {errors?.fullName && <FieldError>{errors.fullName}</FieldError>}
          </EditField>

          <EditField label="Gender">
            <select
              className={selectCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.gender}
              onChange={set("gender")}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors?.gender && <FieldError>{errors.gender}</FieldError>}
          </EditField>

          <EditField label="Date of Birth (BS)">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#2d4a3e]/40">
                <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <NepaliDatePicker
                inputClassName={cn(
                  inputCls,
                  "pl-9",
                  errors?.dobBs && "border-red-400 ring-2 ring-red-100",
                )}
                value={form.dobBs}
                onChange={(bsValue: string) => {
                  setForm((prev) => ({ ...prev, dobBs: bsValue }));
                  try {
                    const adValue = BSToAD(bsValue);
                    setForm((prev) => ({ ...prev, dobAd: adValue }));
                  } catch {}
                }}
                options={{ calenderLocale: "en", valueLocale: "en" }}
              />
            </div>
            {errors?.dobBs && <FieldError>{errors.dobBs}</FieldError>}
          </EditField>

          <EditField label="Date of Birth (AD)">
            <input
              type="date"
              className={cn(
                inputCls,
                errors?.dobAd && "border-red-400 ring-2 ring-red-100",
              )}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.dobAd}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dobAd: e.target.value }))
              }
            />
            <span className="text-[0.70rem] text-[#2d4a3e]/40">
              Auto filled from BS, edit only if conversion is off
            </span>
            {errors?.dobAd && <FieldError>{errors.dobAd}</FieldError>}
          </EditField>

          <EditField label="Phone">
            <input
              className={inputCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.phone}
              onChange={set("phone")}
              placeholder="Phone number"
            />
            {isPhoneValid && (
              <span className="text-[0.72rem] text-emerald-600 font-medium">
                ✓ Valid Nepali number
              </span>
            )}
            {errors?.phone && <FieldError>{errors.phone}</FieldError>}
          </EditField>

          {/* Email */}
          <EditField label="Email">
            <div className="flex min-w-0 cursor-not-allowed items-center gap-1.5 border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] px-3 py-2">
              <Mail
                className="h-3.5 w-3.5 flex-shrink-0 text-[#2d4a3e]/25"
                strokeWidth={2}
              />
              <span
                className="min-w-0 truncate text-[0.88rem] text-[#2d4a3e]/40"
                style={{ fontFamily: "var(--font-dm-sans)" }}
                title={student.email ?? "Not provided"}
              >
                {student.email ?? "Not provided"}
              </span>
            </div>
          </EditField>

          <EditField label="Source">
            <select
              className={selectCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.source}
              onChange={set("source")}
            >
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="referral">Referral</option>
              <option value="inperson">In Person</option>
            </select>
            {errors?.source && <FieldError>{errors.source}</FieldError>}
          </EditField>

          <EditField label="Shift">
            <select
              className={selectCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.shift}
              onChange={(e) => {
                const value = e.target.value as PersonalInfoForm["shift"];
                setForm((prev) => ({
                  ...prev,
                  shift: value,
                  shiftTime: shiftTimeMap[value] ?? prev.shiftTime,
                }));
              }}
            >
              <option value="morning">Morning</option>
              <option value="day">Day</option>
              <option value="evening">Evening</option>
            </select>
            {errors?.shift && <FieldError>{errors.shift}</FieldError>}
          </EditField>

          <EditField label="Shift Time">
            <input
              className={cn(inputCls, "cursor-not-allowed opacity-60")}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.shiftTime}
              onChange={set("shiftTime")}
              placeholder="Auto-filled based on shift"
              disabled
            />
            <span className="text-[0.70rem] text-[#2d4a3e]/40">
              Automatically set when a shift is selected
            </span>
            {errors?.shiftTime && <FieldError>{errors.shiftTime}</FieldError>}
          </EditField>

          <EditField label="Batch">
            <input
              className={inputCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.batch}
              onChange={set("batch")}
              placeholder="Batch name or number"
            />
            {errors?.batch && <FieldError>{errors.batch}</FieldError>}
          </EditField>

          {/* Address */}
          <EditField label="Address" className="lg:col-span-2">
            <input
              className={inputCls}
              style={{ fontFamily: "var(--font-dm-sans)" }}
              value={form.address}
              onChange={set("address")}
              placeholder="Full address"
            />
            {errors?.address && <FieldError>{errors.address}</FieldError>}
          </EditField>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InfoRow label="Full Name" value={student.fullName} icon={User} />
          <InfoRow label="Gender" value={student.gender} icon={User} />
          <InfoRow
            label="Date of Birth (BS)"
            value={String(new getMonth(student.dobBs)) ?? "—"}
            icon={CalendarDays}
          />
          <InfoRow
            label="Date of Birth (AD)"
            value={
              student.dobAd
                ? new Date(student.dobAd).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
            icon={CalendarDays}
          />
          <InfoRow label="Phone" value={student.phone} icon={Phone} />
          {/* Email: pass a truncate/title prop if InfoRow supports it, or wrap it */}
          <InfoRow
            label="Email"
            value={student.email ?? "Not provided"}
            icon={Mail}
            truncate={true}
          />
          <InfoRow label="Source" value={student.source} icon={Hash} />
          <InfoRow label="Shift" value={student.shift ?? "—"} icon={Clock} />
          <InfoRow
            label="Shift Time"
            value={student.shiftTime ?? "—"}
            icon={Clock}
          />
          <InfoRow
            label="Batch"
            value={student.batch ?? "—"}
            icon={GraduationCap}
          />
          {/* Address spans full width in view mode too */}
          <InfoRow
            label="Address"
            value={student.address}
            icon={MapPin}
            className="lg:col-span-2"
          />
        </div>
      )}
    </SectionCard>
  );
}
