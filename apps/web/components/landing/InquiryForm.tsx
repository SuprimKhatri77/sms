"use client";

import api from "@/lib/axios";
import { mapFieldErrors } from "@/utils/api";
import { APIResponse, type InquiryForm, inquiryFormSchema } from "@repo/types";
import { useForm } from "@tanstack/react-form-nextjs";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { siteInfo } from "@/utils/site-info";
import {
  landingContainerClass,
  landingEyebrowClass,
  landingMutedSectionClass,
  landingPrimaryButtonClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "./landing-styles";
import { cn } from "@/lib/utils";
import { LandingSectionPattern } from "./LandingSectionPattern";

const sourceOptions = [
  { value: "", label: "How did you hear about us?" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Referral (Friend / Family)" },
  { value: "in_person", label: "In Person" },
];

const PhoneIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.18 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const floatingLabelClass =
  "pointer-events-none absolute left-0 top-5 font-(family-name:--font-dm-sans) text-[0.9rem] text-[rgba(47,78,64,0.5)] transition-all duration-200 peer-focus:top-0 peer-focus:text-[0.72rem] peer-focus:font-medium peer-focus:text-(--brand-brown) peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.72rem] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-(--brand-green)";

const underlineFieldClass =
  "peer w-full border-0 border-b bg-transparent px-0 pt-6 pb-2.5 font-(family-name:--font-dm-sans) text-sm text-(--brand-ink) outline-none transition-[border-color] duration-200";

function fieldBorder(hasError: boolean) {
  return hasError
    ? "border-red-400 focus:border-red-500"
    : "border-[rgba(47,78,64,0.22)] focus:border-(--brand-green)";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-1.5 font-(family-name:--font-dm-sans) text-[0.76rem] text-red-500"
      role="alert"
    >
      {message}
    </p>
  );
}

function FloatingInput({
  id,
  label,
  required,
  error,
  className,
  ...props
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
} & Omit<ComponentProps<"input">, "placeholder">) {
  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          placeholder=" "
          className={cn(underlineFieldClass, fieldBorder(!!error))}
          aria-invalid={!!error}
          {...props}
        />
        <label htmlFor={id} className={floatingLabelClass}>
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function FloatingTextarea({
  id,
  label,
  required,
  error,
  className,
  ...props
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
} & Omit<ComponentProps<"textarea">, "placeholder">) {
  return (
    <div className={className}>
      <div className="relative">
        <textarea
          id={id}
          placeholder=" "
          rows={4}
          className={cn(
            underlineFieldClass,
            fieldBorder(!!error),
            "min-h-27.5 resize-y",
          )}
          aria-invalid={!!error}
          {...props}
        />
        <label htmlFor={id} className={floatingLabelClass}>
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function FloatingSelect({
  id,
  label,
  required,
  error,
  value,
  onValueChange,
  options,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id}-listbox`;
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label ?? "Select an option";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef}>
      <div className="relative pt-1">
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-0 top-0 z-10 font-(family-name:--font-dm-sans) text-[0.72rem] font-medium text-(--brand-brown)"
        >
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>

        <button
          type="button"
          id={id}
          aria-invalid={!!error}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex w-full items-center justify-between gap-3 border-0 border-b bg-transparent pt-6 pb-3 text-left",
            "font-(family-name:--font-dm-sans) text-sm outline-none transition-[border-color] duration-200",
            fieldBorder(!!error),
            open ? "border-(--brand-green)" : "focus-visible:border-(--brand-green)",
            value ? "text-(--brand-ink)" : "text-[rgba(47,78,64,0.5)]",
          )}
        >
          <span className="min-w-0 flex-1 leading-snug">{selectedLabel}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-(--brand-green) transition-transform duration-200",
              open && "rotate-180",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden border border-[rgba(47,78,64,0.12)] bg-white shadow-[0_16px_40px_rgba(47,78,64,0.12)]"
          >
            {options.map((opt) => {
              const isSelected = value === opt.value;

              return (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
                      "font-(family-name:--font-dm-sans) text-sm transition-colors duration-150",
                      isSelected
                        ? "bg-[rgba(47,78,64,0.08)] font-medium text-(--brand-green)"
                        : "text-[rgba(47,78,64,0.72)] hover:bg-[rgba(47,78,64,0.05)] hover:text-(--brand-green)",
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected ? (
                      <Check
                        className="h-4 w-4 shrink-0 text-(--brand-brown)"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ContactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ContactCard({ icon, label, value }: ContactCardProps) {
  return (
    <div className="flex items-start gap-4 border-b border-[rgba(47,78,64,0.1)] pb-5 last:border-b-0 last:pb-0">
      <span className="mt-0.5 shrink-0 text-(--brand-brown)">{icon}</span>
      <div>
        <div className="mb-0.5 font-(family-name:--font-dm-sans) text-[0.72rem] font-semibold uppercase tracking-widest text-(--brand-brown)">
          {label}
        </div>
        <div className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--brand-green)">
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InquiryFormPage() {
  const [errors, setErrors] = useState<Partial<InquiryForm>>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async (data: InquiryForm) => {
      const res = await api.post("/students/inquiry", data);
      return res.data;
    },
    onSuccess: (result: APIResponse) => {
      setSubmitted(true);
      toast.success(result.message);
      formReset();
      reset();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as APIResponse;
        if (data?.errors) {
          setErrors(mapFieldErrors(data));
        }
        toast.error(error.message || "Something went wrong");
      }
    },
  });

  const {
    Field: FormField,
    handleSubmit,
    reset: formReset,
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
      source: "" as InquiryForm["source"],
    },
    validators: {
      onSubmit: inquiryFormSchema,
    },
    onSubmit: ({ value }) => mutate(value),
    onSubmitInvalid: ({ formApi }) => {
      formApi.validate("submit");
    },
  });

  return (
    <section
      id="inquiry"
      aria-labelledby="inquiry-heading"
      className={`${landingMutedSectionClass} relative overflow-hidden`}
    >
      <LandingSectionPattern variant="inquiry" />
      <div
        className={`${landingContainerClass} grid grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.25fr]`}
      >
        {/* ── Left: Info ── */}
        <div>
          <span className={`${landingEyebrowClass} mb-3 inline-block`}>
            Get In Touch
          </span>

          <h2 id="inquiry-heading" className={`${landingSectionTitleClass} mb-5`}>
            Have a Question?
            <br />
            <em
              className="font-medium text-(--brand-brown)"
              style={{ fontStyle: "italic" }}
            >
              Let&apos;s Talk.
            </em>
          </h2>

          <p className={`${landingSectionBodyClass} mb-10`}>
            Whether you&apos;re curious about our programs, fees, or how to
            apply — send us a message and our admissions team will respond
            promptly.
          </p>

          <div className="flex flex-col gap-5">
            <ContactCard
              icon={<PhoneIcon />}
              label="Call Us"
              value={siteInfo.contact.phone}
            />
            <ContactCard
              icon={<MailIcon />}
              label="Email Us"
              value={siteInfo.contact.email}
            />
            <ContactCard
              icon={<ClockIcon />}
              label="Office Hours"
              value={siteInfo.contact.officeHours}
            />
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="p-0 lg:pt-2">
          {submitted ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <span className="text-(--brand-green)">
                <CheckCircleIcon />
              </span>
              <h3
                className="text-2xl font-semibold"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--brand-green)",
                }}
              >
                Inquiry Sent!
              </h3>
              <p
                className="text-sm leading-relaxed max-w-xs"
                style={{ fontFamily: "var(--font-dm-sans)", color: "#666" }}
              >
                Thank you for reaching out. Our admissions team will contact you
                within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className={`${landingPrimaryButtonClass} mt-2 cursor-pointer bg-(--brand-green) hover:brightness-100`}
              >
                Send Another
              </button>
            </div>
          ) : (
            /* ── Form fields ── */
            <>
              <h3
                className="text-xl font-semibold mb-1"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--brand-green)",
                }}
              >
                Send an Inquiry
              </h3>
              <p
                className="text-[0.83rem] mb-7"
                style={{ fontFamily: "var(--font-dm-sans)", color: "#999" }}
              >
                Fields marked <span className="text-red-500">*</span> are
                required.
              </p>

              <form
                aria-label="Academy inquiry form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex flex-col gap-7"
              >
                <FormField name="fullName">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.fullName;
                    return (
                      <FloatingInput
                        id="full_name"
                        name="full_name"
                        type="text"
                        label="Full Name"
                        required
                        error={mergedError}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    );
                  }}
                </FormField>

                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-6">
                  <FormField name="phone">
                    {(field) => {
                      const fieldError = field.state.meta.errors[0]?.message;
                      const mergedError = fieldError ?? errors.phone;
                      return (
                        <FloatingInput
                          id="phone"
                          name="phone"
                          type="tel"
                          label="Phone"
                          required
                          error={mergedError}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      );
                    }}
                  </FormField>
                  <FormField name="email">
                    {(field) => {
                      const fieldError = field.state.meta.errors[0]?.message;
                      const mergedError = fieldError ?? errors.email;
                      return (
                        <FloatingInput
                          id="email"
                          name="email"
                          type="email"
                          label="Email"
                          required
                          error={mergedError}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      );
                    }}
                  </FormField>
                </div>

                <FormField name="source">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.source;
                    return (
                      <FloatingSelect
                        id="source"
                        label="How did you hear about us?"
                        required
                        error={mergedError}
                        value={field.state.value}
                        onValueChange={(v) =>
                          field.handleChange(v as InquiryForm["source"])
                        }
                        options={sourceOptions.filter((opt) => opt.value !== "")}
                      />
                    );
                  }}
                </FormField>

                <FormField name="message">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.message;
                    return (
                      <FloatingTextarea
                        id="message"
                        name="message"
                        label="Your message"
                        required
                        error={mergedError}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    );
                  }}
                </FormField>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isPending}
                  className={`${landingPrimaryButtonClass} w-full cursor-pointer py-3.5 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isPending ? (
                    <>
                      <span
                        className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                        aria-hidden="true"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Inquiry
                      <SendIcon />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
