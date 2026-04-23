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
} from "lucide-react";
import { StepTitle } from "./StepTile";
import { InputField } from "./InputField";
import { TileGroup } from "./TileGroup";
import { MultiTileGroup } from "./MultiTileGroup";
import { ReviewSection } from "./ReviewSection";
import { ReviewRow } from "./ReviewRow";

interface FormData {
  full_name: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  course: string[];
  source: string;
  claimed_amount: string;
  photo: File | null;
}

interface FieldError {
  [key: string]: string;
}

const COURSES = ["Barista", "Bakery", "Bartending", "Sushi"] as const;

const SOURCES = [
  { value: "fb", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "insta", label: "Instagram" },
  { value: "referral", label: "Referral" },
  { value: "inperson", label: "In Person" },
] as const;

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

const STEPS = ["Personal", "Guardian", "Course", "Review"] as const;

const INITIAL_FORM: FormData = {
  full_name: "",
  dob: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  guardian_name: "",
  guardian_phone: "",
  course: [],
  source: "",
  claimed_amount: "",
  photo: null,
};

function validateStep(step: number, data: FormData): FieldError {
  const errors: FieldError = {};

  if (step === 0) {
    if (!data.full_name.trim()) errors.full_name = "Full name is required";
    if (!data.dob) errors.dob = "Date of birth is required";
    if (!data.gender) errors.gender = "Please select a gender";
    if (!data.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(data.phone))
      errors.phone = "Enter a valid phone number";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Enter a valid email address";
    if (!data.address.trim()) errors.address = "Address is required";
  }

  if (step === 1) {
    if (!data.guardian_name.trim())
      errors.guardian_name = "Guardian name is required";
    if (!data.guardian_phone.trim())
      errors.guardian_phone = "Guardian phone is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(data.guardian_phone))
      errors.guardian_phone = "Enter a valid phone number";
  }

  if (step === 2) {
    if (!data.course.length)
      errors.course = "Please select at least one course";
    if (!data.source) errors.source = "Please select how you heard about us";
    if (!data.claimed_amount.trim())
      errors.claimed_amount = "Please enter an amount";
    else if (
      isNaN(Number(data.claimed_amount)) ||
      Number(data.claimed_amount) < 0
    )
      errors.claimed_amount = "Enter a valid amount";
  }

  return errors;
}

export default function AdmissionPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [referenceNo, setReferenceNo] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const set = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, photo: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const goNext = () => {
    const stepErrors = validateStep(currentStep, form);
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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "photo" && v instanceof File) body.append("photo", v);
        else if (v !== null) body.append(k, String(v));
      });

      const res = await fetch("/api/admission", {
        method: "POST",
        body,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Submission failed");
      setReferenceNo(json.reference_no);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sourceLabel =
    SOURCES.find((s) => s.value === form.source)?.label ?? form.source;
  const genderLabel =
    GENDERS.find((g) => g.value === form.gender)?.label ?? form.gender;

  if (referenceNo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1ec] px-6 py-24">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2d4a3e]/10">
              <CheckCircle2
                className="h-10 w-10 text-[#2d4a3e]"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h1
            className="mb-3 text-[clamp(1.8rem,4vw,2.4rem)] font-bold text-[#2d4a3e]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Application Submitted!
          </h1>
          <p
            className="mb-8 text-[1rem] leading-[1.7] text-[#666]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Thank you, <strong>{form.full_name}</strong>. Our team will review
            your application and get in touch within 24–48 hours.
          </p>
          <div className="mb-8 rounded-2xl border border-[#2d4a3e]/10 bg-white px-8 py-6">
            <p
              className="mb-1 text-[0.78rem] font-semibold uppercase tracking-widest text-[#2d4a3e]/50"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Your Reference Number
            </p>
            <p
              className="text-[2rem] font-bold tracking-widest text-[#e8552a]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {referenceNo}
            </p>
            <p
              className="mt-1 text-[0.8rem] text-[#999]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Save this number — you&apos;ll need it to track your status.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-[#2d4a3e]/60 transition-colors hover:text-[#2d4a3e]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // ── Form ──
  return (
    <main className="min-h-screen bg-[#f4f1ec] px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[#2d4a3e]/50 transition-colors hover:text-[#2d4a3e]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span
            className="mb-2 inline-block text-[0.78rem] font-semibold uppercase tracking-widest text-[#e8552a]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Admissions 2025–26
          </span>
          <h1
            className="text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-[1.15] text-[#2d4a3e]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Apply to{" "}
            <em
              className="font-medium text-[#7d6b8a]"
              style={{ fontStyle: "italic" }}
            >
              Greenfield
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
                            ? "bg-[#e8552a] text-white shadow-[0_2px_12px_rgba(232,85,42,0.35)]"
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
                          ? "text-[#e8552a]"
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
        <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.05)] sm:p-10">
          {/* Step 0 — Personal */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-5">
              <StepTitle icon={User} title="Personal Information" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InputField
                    label="Full Name"
                    icon={User}
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    error={errors.full_name}
                  />
                </div>
                <InputField
                  label="Date of Birth"
                  icon={Calendar}
                  required
                  type="date"
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  error={errors.dob}
                />
                <TileGroup
                  label="Gender"
                  options={GENDERS}
                  value={form.gender}
                  onChange={(v) => set("gender", v)}
                  error={errors.gender}
                  required
                />
                <InputField
                  label="Phone"
                  icon={Phone}
                  required
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  error={errors.phone}
                />
                <InputField
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="optional"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={errors.email}
                />
                <div className="sm:col-span-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      Address <span className="text-[#e8552a]">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-3.5 text-[#2d4a3e]/40">
                        <MapPin className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <textarea
                        rows={3}
                        placeholder="Street, City, District"
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        className={`w-full resize-none rounded-xl border bg-white py-3 pl-10 pr-4 text-[0.92rem] text-[#2d4a3e] outline-none transition-all duration-200 placeholder:text-[#2d4a3e]/30 focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15 ${
                          errors.address
                            ? "border-red-400 ring-2 ring-red-100"
                            : "border-[#2d4a3e]/15"
                        }`}
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      />
                    </div>
                    {errors.address && (
                      <p
                        className="text-[0.78rem] text-red-500"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Photo upload */}
                <div className="sm:col-span-2">
                  <label
                    className="mb-1.5 block text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Photo{" "}
                    <span className="font-normal normal-case text-[#2d4a3e]/40">
                      (optional)
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#2d4a3e]/20 bg-[#f4f1ec]/60 p-4 transition-colors hover:border-[#e8552a]/40 hover:bg-[#e8552a]/5">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoPreview}
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
                      <p
                        className="text-[0.88rem] font-medium text-[#2d4a3e]"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {form.photo
                          ? form.photo.name
                          : "Upload a passport photo"}
                      </p>
                      <p
                        className="text-[0.78rem] text-[#2d4a3e]/40"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        JPG, PNG — max 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Guardian */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-5">
              <StepTitle icon={Users} title="Guardian Information" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InputField
                    label="Guardian Full Name"
                    icon={User}
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={form.guardian_name}
                    onChange={(e) => set("guardian_name", e.target.value)}
                    error={errors.guardian_name}
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="Guardian Phone"
                    icon={Phone}
                    required
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    value={form.guardian_phone}
                    onChange={(e) => set("guardian_phone", e.target.value)}
                    error={errors.guardian_phone}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Course */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <StepTitle icon={BookOpen} title="Course & Details" />
              <MultiTileGroup
                label="Select Course(s)"
                options={COURSES.map((c) => ({ value: c, label: c }))}
                value={form.course}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, course: v }));
                  if (errors.course)
                    setErrors((prev) => ({ ...prev, course: "" }));
                }}
                error={errors.course}
                required
              />
              <TileGroup
                label="How did you hear about us?"
                options={[...SOURCES]}
                value={form.source}
                onChange={(v) => set("source", v)}
                error={errors.source}
                required
              />
              <InputField
                label="Claimed Amount (NPR)"
                icon={DollarSign}
                required
                type="number"
                min="0"
                placeholder="e.g. 15000"
                value={form.claimed_amount}
                onChange={(e) => set("claimed_amount", e.target.value)}
                error={errors.claimed_amount}
              />
            </div>
          )}

          {/* Step 3 — Review */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6">
              <StepTitle icon={CheckCircle2} title="Review & Submit" />
              <div className="space-y-4">
                <ReviewSection title="Personal">
                  <ReviewRow label="Full Name" value={form.full_name} />
                  <ReviewRow label="Date of Birth" value={form.dob} />
                  <ReviewRow label="Gender" value={genderLabel} />
                  <ReviewRow label="Phone" value={form.phone} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Address" value={form.address} />
                  {photoPreview && (
                    <div className="flex items-center justify-between py-3">
                      <span
                        className="text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/50"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        Photo
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </ReviewSection>
                <ReviewSection title="Guardian">
                  <ReviewRow label="Name" value={form.guardian_name} />
                  <ReviewRow label="Phone" value={form.guardian_phone} />
                </ReviewSection>
                <ReviewSection title="Course & Details">
                  <ReviewRow
                    label="Course(s)"
                    value={form.course.length ? form.course.join(", ") : ""}
                  />
                  <ReviewRow label="Source" value={sourceLabel} />
                  <ReviewRow
                    label="Claimed Amount"
                    value={
                      form.claimed_amount
                        ? `NPR ${Number(form.claimed_amount).toLocaleString()}`
                        : ""
                    }
                  />
                </ReviewSection>
              </div>
              <p
                className="rounded-xl bg-[#2d4a3e]/05 px-4 py-3 text-[0.82rem] leading-[1.6] text-[#2d4a3e]/60"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                By submitting, you confirm that all information provided is
                accurate. Our team will contact you within 24–48 hours.
              </p>
            </div>
          )}

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
                className="inline-flex items-center gap-2 rounded-xl bg-[#e8552a] px-6 py-3 text-[0.9rem] font-semibold text-white shadow-[0_4px_16px_rgba(232,85,42,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(232,85,42,0.4)]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2d4a3e] px-6 py-3 text-[0.9rem] font-semibold text-white shadow-[0_4px_16px_rgba(45,74,62,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(45,74,62,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {submitting ? "Submitting…" : "Submit Application"}
                {!submitting && <CheckCircle2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
