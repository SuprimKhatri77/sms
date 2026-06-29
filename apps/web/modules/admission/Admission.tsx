"use client";

import { useState } from "react";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  Loader2,
  Clock,
} from "lucide-react";
import { StepTitle } from "./StepTile";
import { AdmissionStepNav } from "./AdmissionStepNav";
import { AdmissionSidePanel } from "./AdmissionSidePanel";
import { AdmissionHero } from "./AdmissionHero";
import { ADMISSION_STEPS } from "./admission-constants";
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
  StudentAdmissionResponse,
} from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import axios from "axios";
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useAdmissionStore } from "@/store/useAdmissionStore";
import { useRouter } from "next/navigation";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import { BSToAD } from "bikram-sambat-js";
import {
  admissionBoxInputClass,
  admissionCalloutClass,
  admissionErrorClass,
  admissionPhotoDropClass,
  admissionWizardShellClass,
  admissionInputClass,
  admissionInputErrorBorder,
  admissionInputNormalBorder,
  admissionLabelClass,
  admissionPrimaryBtnClass,
  admissionSecondaryBtnClass,
} from "./admission-styles";
import { landingContainerClass } from "@/components/landing/landing-styles";

interface FieldError {
  fullName?: string;
  dobAD?: string;
  dobBS?: string;
  gender?: string;
  phone?: string;
  // email?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  courses?: string;
  source?: string;
  // claimedAmount?: string;
  photoUrl?: string;
  shift?: string;
  shiftTime?: string;
}

const FIELD_STEP_MAP: Record<keyof FieldError, number> = {
  fullName: 0,
  dobAD: 0,
  dobBS: 0,
  gender: 0,
  phone: 0,
  // email: 0,
  address: 0,
  photoUrl: 0,

  guardianName: 1,
  guardianPhone: 1,

  courses: 2,
  source: 2,
  // claimedAmount: 2,
  shift: 2,
  shiftTime: 2,
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

type ValidateStepData = Omit<CreateStudentAdmission, "dobBS"> & {
  dobBS: string;
  dobAD: string;
};

function validateStep(step: number, data: ValidateStepData): FieldError {
  const errors: FieldError = {};

  if (step === 0) {
    if (!data.fullName.trim()) errors.fullName = "Full name is required";
    if (!data.dobBS) errors.dobBS = "Date of birth is required";
    if (!data.dobAD) errors.dobAD = "Date of birth is required";
    if (!data.gender) errors.gender = "Please select a gender";
    if (!data.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(data.phone))
      errors.phone = "Enter a valid phone number";
    // if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    //   errors.email = "Enter a valid email address";
    if (!data.address.trim()) errors.address = "Address is required";
    // if (!data.photoUrl.trim()) errors.photoUrl = "Photo is required";
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
    if (!data.shift) errors.shift = "Please select a shift";
    if (!data.shiftTime) errors.shiftTime = "Please enter a shift time";
    // if (!String(data.claimedAmount).trim())
    //   errors.claimedAmount = "Please enter an amount";
    // else if (
    //   isNaN(Number(data.claimedAmount)) ||
    //   Number(data.claimedAmount) < 0
    // )
    //   errors.claimedAmount = "Enter a valid amount";
  }

  return errors;
}

type Props = {
  courses: Extract<CoursesList, { success: true }>["data"];
};
export default function AdmissionPage({ courses }: Props) {
  const user = useAuthStore((state) => state.user);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Partial<FieldError>>({});
  const [photo, setPhoto] = useState<{
    url: string;
    publicID: string;
    fileName: string;
  }>();
  const [dobAD, setDobAD] = useState("");
  const setSubmittedStudent = useAdmissionStore((s) => s.setSubmittedStudent);
  const router = useRouter();

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async (data: CreateStudentAdmission) => {
      const res = await api.post<StudentAdmissionResponse>(
        "/students/admission",
        data,
      );
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setSubmittedStudent({
        fullName: getFieldValue("fullName"),
        dob: getFieldValue("dobBS"),
        gender: getFieldValue("gender"),
        phone: getFieldValue("phone"),
        address: getFieldValue("address"),
        guardianName: getFieldValue("guardianName"),
        guardianPhone: getFieldValue("guardianPhone"),
        source: getFieldValue("source"),
        shift: getFieldValue("shift") as "morning" | "day" | "evening",
        shiftTime: getFieldValue("shiftTime"),
        courses: getFieldValue("courses").map(
          (id) => courses.find((c) => c.id === id)?.name ?? id,
        ),
        photoURL: getFieldValue("photoUrl") ?? null,
        referenceNo: result.data.referenceNo,
        fiscalYear: result.data.fiscalYear,
        createdAt: result.data.createdAt,
        status: "pending",
        email: user?.email ?? "",
      });
      setPhoto({ url: "", publicID: "", fileName: "" });
      setCurrentStep(0);

      resetForm();
      reset();
      router.push("/admission/success");
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
      // email: user?.email ?? "",
      dobBS: "",
      dobAD: "",
      gender: "" as CreateStudentAdmission["gender"],
      guardianName: "",
      guardianPhone: "",
      courses: [] as string[],
      address: "",
      // claimedAmount: null as number | null,
      photoUrl: null as string | null,
      shift: "" as CreateStudentAdmission["shift"],
      shiftTime: "",
    },
    validators: {
      onSubmit: createStudentAdmissionRequest,
    },
    onSubmit: ({ value }) => {
      mutate({
        ...value,
        // claimedAmount: value.claimedAmount ?? 0,
      });
    },
    onSubmitInvalid: ({ formApi }) => {
      const errors = formApi.state.errors;
      // console.error("errors: ", errors);

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
      dobBS: getFieldValue("dobBS"),
      dobAD: getFieldValue("dobAD"),
      gender: getFieldValue("gender"),
      phone: getFieldValue("phone"),
      // email: getFieldValue("email"),
      address: getFieldValue("address"),
      guardianName: getFieldValue("guardianName"),
      guardianPhone: getFieldValue("guardianPhone"),
      courses: getFieldValue("courses"),
      source: getFieldValue("source"),
      // claimedAmount: getFieldValue("claimedAmount"),
      photoUrl: photo?.url ?? "",
      shift: getFieldValue("shift"),
      shiftTime: getFieldValue("shiftTime"),
    });
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 0);
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

  // const amount = getFieldValue("claimedAmount");

  // ── Form ──
  return (
    <main className="min-h-screen bg-(--brand-cream) pb-16 pt-24">
      <div className={cn(landingContainerClass, "px-4 sm:px-6")}>
        <div className="mx-auto w-full max-w-6xl">
          <AdmissionHero />

          <p className="mb-5 font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[rgba(47,78,64,0.42)]">
            Application form
          </p>

          <div className={admissionWizardShellClass}>
          <AdmissionSidePanel currentStep={currentStep} />

          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <AdmissionStepNav currentStep={currentStep} />

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (currentStep !== ADMISSION_STEPS.length - 1) {
                  return;
                }

                handleSubmit();
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  currentStep !== ADMISSION_STEPS.length - 1
                ) {
                  e.preventDefault();
                }
              }}
              className="flex flex-1 flex-col"
            >
              <div className="flex-1 p-6 sm:p-8 lg:p-10">
          {/* Step 0 — Personal */}
          <div
            className={cn(
              "flex flex-col gap-5",
              currentStep === 0 ? "" : "hidden",
            )}
          >
            <StepTitle
              icon={User}
              title="Personal Information"
              description="Tell us who you are — this helps us prepare your student record."
            />
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:col-span-2">
                <FormField name="dobBS">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.dobBS;

                    return (
                      <div className="flex flex-col gap-1.5">
                        <label className={admissionLabelClass}>
                          Date of Birth (BS){" "}
                          <span className="text-(--brand-brown)">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.38)]">
                            <Calendar className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <NepaliDatePicker
                            inputClassName={cn(
                              admissionBoxInputClass,
                              "py-2.5 pl-9",
                              mergedError
                                ? admissionInputErrorBorder
                                : admissionInputNormalBorder,
                            )}
                            value={field.state.value}
                            onChange={(bsValue: string) => {
                              field.handleChange(bsValue);
                              try {
                                const adValue = BSToAD(bsValue);
                                setDobAD(adValue);
                                setFieldValue("dobAD", adValue);
                              } catch {
                                setDobAD("");
                                setFieldValue("dobAD", "");
                              }
                            }}
                            options={{
                              calenderLocale: "en",
                              valueLocale: "en",
                            }}
                          />
                        </div>
                        {mergedError ? (
                          <p className={admissionErrorClass}>{mergedError}</p>
                        ) : null}
                      </div>
                    );
                  }}
                </FormField>

                <FormField name="dobAD">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.dobBS;
                    return (
                      <div className="flex flex-col gap-1.5">
                        <label className="font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.45)]">
                          Date of Birth (AD)
                          <span className="ml-1 font-normal normal-case tracking-normal text-[rgba(47,78,64,0.4)]">
                            (auto-converted)
                          </span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(47,78,64,0.38)]">
                            <Calendar className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <input
                            type="date"
                            disabled
                            value={dobAD}
                            onChange={(e) => {
                              setDobAD(e.target.value);
                              field.handleChange(e.target.value);
                            }}
                            className={cn(
                              admissionBoxInputClass,
                              admissionInputNormalBorder,
                              "disabled:cursor-not-allowed",
                            )}
                          />
                        </div>
                        {mergedError ? (
                          <p className={admissionErrorClass}>{mergedError}</p>
                        ) : null}
                      </div>
                    );
                  }}
                </FormField>
              </div>

              <FormField name="gender">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.gender;
                  return (
                    <div className="sm:col-span-2">
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
                    </div>
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

              <InputField
                label="Email"
                icon={Mail}
                type="email"
                placeholder="optional"
                value={user?.email ?? ""}
                disabled
                className="border-[rgba(47,78,64,0.14)] bg-[#f4f1ec] text-[rgba(47,78,64,0.5)]"
              />
              <FormField name="address">
                {(field) => {
                  const fieldError = field.state.meta.errors[0]?.message;
                  const mergedError = fieldError ?? errors.address;
                  return (
                    <div className="sm:col-span-2">
                      <div className="flex flex-col gap-1.5">
                        <label className={admissionLabelClass}>
                          Address{" "}
                          <span className="text-(--brand-brown)">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-3.5 text-[rgba(47,78,64,0.38)]">
                            <MapPin className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <textarea
                            rows={3}
                            placeholder="Street, City, District"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={cn(
                              admissionBoxInputClass,
                              "resize-none",
                              mergedError
                                ? admissionInputErrorBorder
                                : admissionInputNormalBorder,
                            )}
                          />
                        </div>
                        {mergedError ? (
                          <p className={admissionErrorClass}>{mergedError}</p>
                        ) : null}
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
                      <label className={admissionLabelClass}>
                        Photo{" "}
                        <span className="font-normal normal-case tracking-normal text-[rgba(47,78,64,0.4)]">
                          (optional)
                        </span>
                      </label>
                      <label className={admissionPhotoDropClass}>
                        {isUploadingImage ? (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.1)] bg-white">
                            <Loader2 className="h-5 w-5 animate-spin text-[rgba(47,78,64,0.4)]" />
                          </div>
                        ) : photo?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo?.url}
                            alt="Preview"
                            className="h-14 w-14 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[rgba(47,78,64,0.1)] bg-white">
                            <Upload
                              className="h-5 w-5 text-[rgba(47,78,64,0.38)]"
                              strokeWidth={1.75}
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-[family-name:var(--font-dm-sans)] text-[0.88rem] font-medium text-(--brand-green)">
                            {isUploadingImage
                              ? "Uploading..."
                              : photo?.url
                                ? photo.fileName
                                : "Upload a passport photo"}
                          </p>
                          <p className="font-[family-name:var(--font-dm-sans)] text-[0.78rem] text-[rgba(47,78,64,0.42)]">
                            JPG or PNG · max 5MB · optional
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
                      {mergedError ? (
                        <p className={admissionErrorClass}>{mergedError}</p>
                      ) : null}
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
            <StepTitle
              icon={Users}
              title="Guardian Information"
              description="Someone we can reach in case of an emergency."
            />
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
            <StepTitle
              icon={BookOpen}
              title="Course & Details"
              description="Choose your program, schedule, and how you found us."
            />
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

            {/* Shift */}
            <FormField name="shift">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.shift;
                return (
                  <TileGroup
                    label="Shift"
                    options={[
                      { value: "morning", label: "Morning" },
                      { value: "day", label: "Day" },
                      { value: "evening", label: "Evening" },
                    ]}
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v as CreateStudentAdmission["shift"]);
                      // auto-fill shiftTime based on selection
                      const timeMap: Record<string, string> = {
                        morning: "8:00–10:00 AM",
                        day: "11:00 AM–1:00 PM",
                        evening: "6:00–8:00 PM",
                      };
                      setFieldValue("shiftTime", timeMap[v as string] ?? "");
                    }}
                    error={mergedError}
                    required
                  />
                );
              }}
            </FormField>

            {/* Shift Time */}
            <FormField name="shiftTime">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.shiftTime;
                return (
                  <InputField
                    label="Shift Time"
                    icon={Clock}
                    type="text"
                    placeholder="Auto-filled based on shift"
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={mergedError}
                    disabled
                    required
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
            <StepTitle
              icon={CheckCircle2}
              title="Review & Submit"
              description="Double-check everything before you send your application."
            />

            <div className="space-y-4">
              <ReviewSection title="Personal">
                <ReviewRow
                  label="Full Name"
                  value={getFieldValue("fullName")}
                />
                <ReviewRow
                  label="Date of Birth (BS)"
                  value={getFieldValue("dobBS")}
                />
                <ReviewRow label="Date of Birth (AD)" value={dobAD} />
                <ReviewRow label="Gender" value={genderLabel} />
                <ReviewRow label="Phone" value={getFieldValue("phone")} />
                <ReviewRow label="Email" value={user?.email ?? ""} />
                <ReviewRow label="Address" value={getFieldValue("address")} />
                {photo?.url && (
                  <div className="flex items-center justify-between py-3">
                    <span className="font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.45)]">
                      Photo
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Preview"
                      className="h-10 w-10 object-cover border border-[rgba(47,78,64,0.1)]"
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
                {/* <ReviewRow
                  label="Claimed Amount"
                  value={
                    amount != null ? `NPR ${amount.toLocaleString()}` : "0"
                  }
                /> */}
              </ReviewSection>
            </div>
            <p className={admissionCalloutClass}>
              By submitting, you confirm that all information provided is
              accurate. Our team will contact you within 24–48 hours.
            </p>
          </div>

            </div>

              <div
                className={cn(
                  "flex border-t border-[rgba(47,78,64,0.08)] px-6 py-5 sm:px-8 lg:px-10",
                  currentStep > 0 ? "justify-between gap-3" : "justify-end",
                )}
              >
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className={cn(admissionSecondaryBtnClass, "px-5 py-3")}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              ) : null}
              <button
                type={
                  currentStep === ADMISSION_STEPS.length - 1 ? "submit" : "button"
                }
                onClick={
                  currentStep === ADMISSION_STEPS.length - 1 ? undefined : goNext
                }
                disabled={
                  currentStep === ADMISSION_STEPS.length - 1 &&
                  (isPending || isUploadingImage)
                }
                className={cn(
                  admissionPrimaryBtnClass,
                  "px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {currentStep === ADMISSION_STEPS.length - 1 ? (
                  <>
                    {isPending ? "Submitting…" : "Submit Application"}
                    {!isPending ? (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                    ) : null}
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                  </>
                )}
              </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
