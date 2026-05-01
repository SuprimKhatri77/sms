"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { StepTitle } from "./StepTile";
import { InputField } from "./InputField";
import { TileGroup } from "./TileGroup";
import { MultiTileGroup } from "./MultiTileGroup";
import { ReviewSection } from "./ReviewSection";
import { ReviewRow } from "./ReviewRow";
import { useForm } from "@tanstack/react-form-nextjs";
import {
  APIResponse,
  CoursesList,
  CreateStudentAdmission,
  createStudentAdmissionRequest,
  ImageUploadResponse,
} from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import axios from "axios";
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import { siteInfo } from "@/utils/site-info";

interface FieldError {
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  courses?: string;
  source?: string;
  claimedAmount?: string;
  photoUrl?: string;
}

const FIELD_STEP_MAP: Record<keyof FieldError, number> = {
  fullName: 0,
  dob: 0,
  gender: 0,
  phone: 0,
  email: 0,
  address: 0,
  photoUrl: 0,

  guardianName: 1,
  guardianPhone: 1,

  courses: 2,
  source: 2,
  claimedAmount: 2,
};

const SOURCES = [
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Referral" },
  { value: "inperson", label: "In Person" },
] as const;

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

const STEPS = ["Personal", "Guardian", "Course", "Review"] as const;

type ValidateStepData = Omit<CreateStudentAdmission, "dob"> & { dob: string };

function validateStep(step: number, data: ValidateStepData): FieldError {
  const errors: FieldError = {};

  console.log("photo url in validate step: ", data.photoUrl);

  if (step === 0) {
    if (!data.fullName.trim()) errors.fullName = "Full name is required";
    if (!data.dob) errors.dob = "Date of birth is required";
    if (!data.gender) errors.gender = "Please select a gender";
    if (!data.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(data.phone))
      errors.phone = "Enter a valid phone number";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Enter a valid email address";
    if (!data.address.trim()) errors.address = "Address is required";
    if (!data.photoUrl.trim()) errors.photoUrl = "Photo is required";
  }

  if (step === 1) {
    if (!data.guardianName.trim())
      errors.guardianName = "Guardian name is required";
    if (!data.guardianPhone.trim())
      errors.guardianPhone = "Guardian phone is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(data.guardianPhone))
      errors.guardianPhone = "Enter a valid phone number";
  }

  if (step === 2) {
    if (!data.courses.length)
      errors.courses = "Please select at least one course";
    if (!data.source) errors.source = "Please select how you heard about us";
    if (!String(data.claimedAmount).trim())
      errors.claimedAmount = "Please enter an amount";
    else if (
      isNaN(Number(data.claimedAmount)) ||
      Number(data.claimedAmount) < 0
    )
      errors.claimedAmount = "Enter a valid amount";
  }

  return errors;
}

type Props = {
  courses: Extract<CoursesList, { success: true }>["data"];
};
export default function AdmissionPage({ courses }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Partial<FieldError>>({});
  const [photo, setPhoto] = useState<{
    url: string;
    publicID: string;
    fileName: string;
  }>();

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async (data: CreateStudentAdmission) => {
      const res = await api.post<APIResponse>("/students/admission", data);
      return res.data;
    },
    onSuccess: (result: APIResponse) => {
      toast.success(result.message);
      setPhoto({ url: "", publicID: "", fileName: "" });
      setCurrentStep(0);

      resetForm();
      reset();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as APIResponse;
        if (data.errors) {
          const mapped = mapFieldErrors(data);
          setErrors(mapped);

          // find first field with error
          const firstField = Object.keys(mapped)[0] as keyof FieldError;

          if (firstField && FIELD_STEP_MAP[firstField] !== undefined) {
            setCurrentStep(FIELD_STEP_MAP[firstField]);
          }

          toast.error("Please fix the highlighted fields");
          return;
        }
      }
      toast.error(error.message || "something went wrong");
    },
  });

  const {
    Field: FormField,
    reset: resetForm,
    handleSubmit,
    getFieldValue,
    setFieldValue,
    setFieldMeta,
  } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      source: "" as CreateStudentAdmission["source"],
      email: "",
      dob: "",
      gender: "" as CreateStudentAdmission["gender"],
      guardianName: "",
      guardianPhone: "",
      courses: [] as string[],
      address: "",
      claimedAmount: null as number | null,
      photoUrl: "",
    },
    validators: {
      onSubmit: createStudentAdmissionRequest,
    },
    onSubmit: ({ value }) => {
      mutate({
        ...value,
        dob: value.dob,
        claimedAmount: value.claimedAmount ?? 0,
      });
    },
    onSubmitInvalid: ({ formApi }) => {
      const errors = formApi.state.errors;

      if (!errors?.length) return;

      const firstErrorObj = errors[0];

      if (!firstErrorObj) return;
      const firstField = Object.keys(firstErrorObj)[0] as keyof FieldError;

      if (firstField && FIELD_STEP_MAP[firstField] !== undefined) {
        setCurrentStep(FIELD_STEP_MAP[firstField]);
      }
      setFieldMeta(firstField, (prev) => ({
        ...prev,
        isTouched: true,
      }));

      toast.error("Please fix the highlighted fields");
    },
  });

  const { mutate: uploadImage, isPending: isUploadingImage } = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post<ImageUploadResponse>("/uploads", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setPhoto((prev) => ({
        url: result.data.imageUrl,
        publicID: result.data.imagePublicID,
        fileName: prev?.fileName || "",
      }));
      setFieldValue("photoUrl", result.data.imageUrl);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // show local preview instantly
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto({
        url: ev.target?.result as string,
        publicID: "",
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);

    // fire upload simultaneously
    const formData = new FormData();
    formData.append("image", file);
    uploadImage(formData);
  };

  const goNext = () => {
    const stepErrors = validateStep(currentStep, {
      fullName: getFieldValue("fullName"),
      dob: getFieldValue("dob"),
      gender: getFieldValue("gender"),
      phone: getFieldValue("phone"),
      email: getFieldValue("email"),
      address: getFieldValue("address"),
      guardianName: getFieldValue("guardianName"),
      guardianPhone: getFieldValue("guardianPhone"),
      courses: getFieldValue("courses"),
      source: getFieldValue("source"),
      claimedAmount: getFieldValue("claimedAmount"),
      photoUrl: photo?.url ?? "",
    });

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  const sourceLabel =
    SOURCES.find((s) => s.value === getFieldValue("source"))?.label ??
    getFieldValue("source");
  const genderLabel =
    GENDERS.find((g) => g.value === getFieldValue("gender"))?.label ??
    getFieldValue("gender");

  const amount = getFieldValue("claimedAmount");

  // ── Form ──
  return (
    <main className="min-h-screen bg-(--brand-cream) px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[rgba(47,78,64,0.55)] transition-colors hover:text-(--brand-green)"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span
            className="mb-2 inline-block text-[0.78rem] font-semibold uppercase tracking-widest text-(--brand-brown)"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {siteInfo.admission.cycleLabel}
          </span>
          <h1
            className="text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-[1.15] text-(--brand-green)"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Apply to{" "}
            <em className="font-medium text-(--brand-brown)" style={{ fontStyle: "italic" }}>
              {siteInfo.company.shortName}
            </em>
          </h1>
        </div>

        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {STEPS.map((label, idx) => {
              const done = idx < currentStep;
              const active = idx === currentStep;
              return (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.75rem] font-bold transition-all duration-300 ${
                        done
                          ? "bg-[#2d4a3e] text-white"
                          : active
                            ? "bg-(--brand-brown) text-white shadow-[0_2px_12px_rgba(194,138,79,0.35)]"
                            : "bg-[#2d4a3e]/10 text-[#2d4a3e]/40"
                      }`}
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`hidden text-[0.72rem] font-semibold uppercase tracking-[0.06em] sm:block ${
                        active
                          ? "text-(--brand-brown)"
                          : done
                            ? "text-[#2d4a3e]"
                            : "text-[#2d4a3e]/35"
                      }`}
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 rounded-full transition-all duration-500 sm:mx-2 ${
                        idx < currentStep ? "bg-[#2d4a3e]" : "bg-[#2d4a3e]/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="rounded-2xl border border-black/6 bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.05)] sm:p-10"
        >
          {/* Step 0 — Personal */}
          <div
            className={cn(
              "flex flex-col gap-5",
              currentStep === 0 ? "" : "hidden",
            )}
          >
            <StepTitle icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField name="fullName">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.fullName;
                  return (
                    <div className="sm:col-span-2">
                      <InputField
                        label="Full Name"
                        icon={User}
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        error={mergedError}
                      />
                    </div>
                  );
                }}
              </FormField>

              <FormField name="dob">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.dob;

                  return (
                    <InputField
                      label="Date of Birth"
                      icon={Calendar}
                      required
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={mergedError}
                    />
                  );
                }}
              </FormField>

              <FormField name="gender">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.gender;
                  return (
                    <TileGroup
                      label="Gender"
                      options={GENDERS}
                      value={field.state.value}
                      onChange={(v) =>
                        field.handleChange(
                          v as CreateStudentAdmission["gender"],
                        )
                      }
                      error={mergedError}
                      required
                    />
                  );
                }}
              </FormField>
              <FormField name="phone">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.phone;
                  return (
                    <InputField
                      label="Phone"
                      icon={Phone}
                      required
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={mergedError}
                    />
                  );
                }}
              </FormField>

              <FormField name="email">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.email;
                  return (
                    <InputField
                      label="Email"
                      icon={Mail}
                      type="email"
                      placeholder="optional"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={mergedError}
                    />
                  );
                }}
              </FormField>
              <FormField name="address">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.address;
                  return (
                    <div className="sm:col-span-2">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-(--brand-green)"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          Address <span className="text-(--brand-brown)">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-3.5 text-[rgba(47,78,64,0.4)]">
                            <MapPin className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <textarea
                            rows={3}
                            placeholder="Street, City, District"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`w-full resize-none rounded-xl border bg-white py-3 pl-10 pr-4 text-[0.92rem] text-(--brand-green) outline-none transition-all duration-200 placeholder:text-[rgba(47,78,64,0.3)] focus:border-(--brand-brown) focus:ring-2 focus:ring-[rgba(194,138,79,0.15)] ${
                              mergedError
                                ? "border-red-400 ring-2 ring-red-100"
                                : "border-[#2d4a3e]/15"
                            }`}
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          />
                        </div>
                        {mergedError && (
                          <p
                            className="text-[0.78rem] text-red-500"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {mergedError}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }}
              </FormField>

              {/* Photo upload */}
              <FormField name="photoUrl">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.photoUrl;
                  return (
                    <div className="sm:col-span-2">
                      <label
                        className="mb-1.5 block text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        Photo <span className="text-[#e8552a]">*</span>
                        {/* <span className="font-normal normal-case text-[#2d4a3e]/40">
                          (optional)
                        </span> */}
                      </label>
                      <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[rgba(47,78,64,0.2)] bg-[rgba(47,78,64,0.04)] p-4 transition-colors hover:border-[rgba(194,138,79,0.5)] hover:bg-[rgba(194,138,79,0.06)]">
                        {isUploadingImage ? (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2d4a3e]/08">
                            <Loader2 className="h-5 w-5 animate-spin text-[#2d4a3e]/40" />
                          </div>
                        ) : photo?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo?.url}
                            alt="Preview"
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2d4a3e]/08">
                            <Upload
                              className="h-5 w-5 text-[#2d4a3e]/40"
                              strokeWidth={1.75}
                            />
                          </div>
                        )}

                        <div>
                          <p className="text-[0.88rem] font-medium text-[#2d4a3e]">
                            {isUploadingImage
                              ? "Uploading..."
                              : photo?.url
                                ? photo.fileName
                                : "Upload a passport photo"}
                          </p>
                          <p className="text-[0.78rem] text-[#2d4a3e]/40">
                            JPG, PNG — max 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                          disabled={isUploadingImage}
                        />
                      </label>
                      {mergedError && (
                        <p
                          className="text-[0.78rem] text-red-500"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                        >
                          {mergedError}
                        </p>
                      )}
                    </div>
                  );
                }}
              </FormField>
            </div>
          </div>

          {/* Step 1 — Guardian */}
          <div
            className={cn(
              "flex flex-col gap-5",
              currentStep === 1 ? "" : "hidden",
            )}
          >
            <StepTitle icon={Users} title="Guardian Information" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField name="guardianName">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.guardianName;
                  return (
                    <div className="sm:col-span-2">
                      <InputField
                        label="Guardian Full Name"
                        icon={User}
                        required
                        placeholder="e.g. Ramesh Sharma"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        error={mergedError}
                      />
                    </div>
                  );
                }}
              </FormField>
              <FormField name="guardianPhone">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = (fieldError ??
                    errors.guardianPhone) as string;
                  return (
                    <div className="sm:col-span-2">
                      <InputField
                        label="Guardian Phone"
                        icon={Phone}
                        required
                        type="tel"
                        placeholder="+977 98XXXXXXXX"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        error={mergedError}
                      />
                    </div>
                  );
                }}
              </FormField>
            </div>
          </div>

          {/* Step 2 — Course */}
          <div
            className={cn(
              "flex flex-col gap-6",
              currentStep === 2 ? "" : "hidden",
            )}
          >
            <StepTitle icon={BookOpen} title="Course & Details" />
            <FormField name="courses">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.courses;
                return (
                  <MultiTileGroup
                    label="Select Course(s)"
                    options={courses.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v);
                      if (mergedError)
                        setErrors((prev) => ({ ...prev, course: "" }));
                    }}
                    error={mergedError}
                    required
                  />
                );
              }}
            </FormField>
            <FormField name="source">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.source;
                return (
                  <TileGroup
                    label="How did you hear about us?"
                    options={[...SOURCES]}
                    value={field.state.value}
                    onChange={(v) =>
                      field.handleChange(v as CreateStudentAdmission["source"])
                    }
                    error={mergedError}
                    required
                  />
                );
              }}
            </FormField>

            <FormField name="claimedAmount">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.claimedAmount;
                return (
                  <InputField
                    label="Claimed Amount (NPR)"
                    icon={DollarSign}
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={field.state.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.handleChange(v === "" ? null : Number(v));
                    }}
                    error={mergedError}
                  />
                );
              }}
            </FormField>
          </div>

          {/* Step 3 — Review */}
          <div
            className={cn(
              "flex flex-col gap-6",
              currentStep === 3 ? "" : "hidden",
            )}
          >
            <StepTitle icon={CheckCircle2} title="Review & Submit" />
            <div className="space-y-4">
              <ReviewSection title="Personal">
                <ReviewRow
                  label="Full Name"
                  value={getFieldValue("fullName")}
                />
                <ReviewRow label="Date of Birth" value={getFieldValue("dob")} />
                <ReviewRow label="Gender" value={genderLabel} />
                <ReviewRow label="Phone" value={getFieldValue("phone")} />
                <ReviewRow label="Email" value={getFieldValue("email")} />
                <ReviewRow label="Address" value={getFieldValue("address")} />
                {photo?.url && (
                  <div className="flex items-center justify-between py-3">
                    <span
                      className="text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/50"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      Photo
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </div>
                )}
              </ReviewSection>
              <ReviewSection title="Guardian">
                <ReviewRow label="Name" value={getFieldValue("guardianName")} />
                <ReviewRow
                  label="Phone"
                  value={getFieldValue("guardianPhone")}
                />
              </ReviewSection>
              <ReviewSection title="Course & Details">
                <ReviewRow
                  label="Course(s)"
                  value={
                    getFieldValue("courses").length
                      ? getFieldValue("courses")
                          .map(
                            (id) =>
                              courses.find((c) => c.id === id)?.name ?? id,
                          )
                          .join(" ,")
                      : ""
                  }
                />
                <ReviewRow label="Source" value={sourceLabel} />
                <ReviewRow
                  label="Claimed Amount"
                  value={
                    amount != null ? `NPR ${amount.toLocaleString()}` : "0"
                  }
                />
              </ReviewSection>
            </div>
            <p
              className="rounded-xl bg-[#2d4a3e]/05 px-4 py-3 text-[0.82rem] leading-[1.6] text-[#2d4a3e]/60"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              By isPending, you confirm that all information provided is
              accurate. Our team will contact you within 24-48 hours.
            </p>
          </div>

          {/* Navigation */}
          <div
            className={`mt-8 flex ${currentStep > 0 ? "justify-between" : "justify-end"}`}
          >
            {currentStep > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2d4a3e]/15 bg-white px-5 py-3 text-[0.9rem] font-medium text-[#2d4a3e] transition-all duration-200 hover:border-[#2d4a3e]/30 hover:bg-[#2d4a3e]/05"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-(--brand-brown) px-6 py-3 text-[0.9rem] font-semibold text-white shadow-[0_4px_16px_rgba(194,138,79,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(194,138,79,0.4)]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending || isUploadingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2d4a3e] px-6 py-3 text-[0.9rem] font-semibold text-white shadow-[0_4px_16px_rgba(45,74,62,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(45,74,62,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {isPending ? "Submitting…" : "Submit Application"}
                {!isPending && <CheckCircle2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
