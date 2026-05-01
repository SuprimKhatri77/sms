"use client";

import api from "@/lib/axios";
import { mapFieldErrors } from "@/utils/api";
import { APIResponse, type InquiryForm, inquiryFormSchema } from "@repo/types";
import { useForm } from "@tanstack/react-form-nextjs";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { siteInfo } from "@/utils/site-info";

type FormData = {
  full_name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
};

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

const ChevronDownIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ContactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ContactCard({ icon, label, value }: ContactCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-black/6">
      <span
        className="mt-0.5 shrink-0 p-2 rounded-lg"
        style={{
          backgroundColor: "rgba(232,85,42,0.08)",
          color: "var(--brand-orange)",
        }}
      >
        {icon}
      </span>
      <div>
        <div
          className="text-[0.72rem] font-semibold tracking-widest uppercase mb-0.5"
          style={{
            fontFamily: "var(--font-dm-sans)",
            color: "var(--brand-orange)",
          }}
        >
          {label}
        </div>
        <div
          className="text-sm font-medium"
          style={{
            fontFamily: "var(--font-dm-sans)",
            color: "var(--brand-green)",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  id: keyof FormData;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, id, required, optional, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[0.8rem] font-semibold tracking-wide"
        style={{
          fontFamily: "var(--font-dm-sans)",
          color: "var(--brand-green)",
        }}
      >
        {label} {required && <span className="text-red-500">*</span>}
        {optional && (
          <span className="font-normal" style={{ color: "#aaa" }}>
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          className="text-[0.76rem] text-red-500"
          style={{ fontFamily: "var(--font-dm-sans)" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input class helper ───────────────────────────────────────────────────────
// focus ring uses CSS var — must be inline for the box-shadow value
const inputBase =
  "w-full px-4 py-3 rounded-xl text-sm text-[#1a1a1a] bg-white outline-none transition-all duration-200";

function inputBorder(hasError: boolean) {
  return hasError
    ? "border-[1.5px] border-red-500"
    : "border-[1.5px] border-[rgba(45,74,62,0.15)] focus:border-[var(--brand-green)]";
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

  // Shared focus/blur handlers — CSS vars can't be in Tailwind focus: classes
  const focusProps = (field: keyof InquiryForm) => ({
    onFocus: (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      if (!errors[field]) e.target.style.borderColor = "var(--brand-green)";
      e.target.style.boxShadow = "0 0 0 3px rgba(45,74,62,0.1)";
    },
    onBlur: (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      if (!errors[field]) e.target.style.borderColor = "rgba(45,74,62,0.15)";
      e.target.style.boxShadow = "none";
    },
  });

  return (
    <section
      id="inquiry"
      className="py-24 px-6"
      style={{ backgroundColor: "#faf9f7" }}
    >
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-16 items-start">
        {/* ── Left: Info ── */}
        <div>
          <span
            className="inline-block text-[0.75rem] font-semibold tracking-widest uppercase mb-3"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "var(--brand-orange)",
            }}
          >
            Get In Touch
          </span>

          <h2
            className="font-bold leading-tight mb-5"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
              color: "var(--brand-green)",
            }}
          >
            Have a Question?
            <br />
            <em
              className="font-medium not-italic"
              style={{ color: "var(--brand-mauve)", fontStyle: "italic" }}
            >
              Let&apos;s Talk.
            </em>
          </h2>

          <p
            className="text-[0.95rem] leading-[1.75] mb-10"
            style={{ fontFamily: "var(--font-dm-sans)", color: "#666" }}
          >
            Whether you&apos;re curious about our programs, fees, or how to
            apply — send us a message and our admissions team will respond
            promptly.
          </p>

          <div className="flex flex-col gap-4">
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
        <div
          className="bg-white rounded-2xl p-8 border border-black/[0.07]"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.05)" }}
        >
          {submitted ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <span style={{ color: "var(--brand-sage)" }}>
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
                onClick={() => setSubmitted(false)}
                className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  backgroundColor: "var(--brand-green)",
                }}
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
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex flex-col gap-5"
              >
                {/* Full Name */}
                <FormField name="fullName">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.fullName;
                    return (
                      <Field
                        id="full_name"
                        label="Full Name"
                        required
                        error={mergedError}
                      >
                        <input
                          id="full_name"
                          name="full_name"
                          type="text"
                          placeholder="e.g. Jane Doe"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`${inputBase} ${inputBorder(!!mergedError)}`}
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                          {...focusProps("fullName")}
                        />
                      </Field>
                    );
                  }}
                </FormField>

                {/* Phone + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField name="phone">
                    {(field) => {
                      const fieldError = field.state.meta.errors[0]?.message;
                      const mergedError = fieldError ?? errors.phone;
                      return (
                        <Field
                          id="phone"
                          label="Phone"
                          required
                          error={mergedError}
                        >
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+1 555 0001234"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`${inputBase} ${inputBorder(!!mergedError)}`}
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                            {...focusProps("phone")}
                          />
                        </Field>
                      );
                    }}
                  </FormField>
                  <FormField name="email">
                    {(field) => {
                      const fieldError = field.state.meta.errors[0]?.message;
                      const mergedError = fieldError ?? errors.email;
                      return (
                        <Field
                          id="email"
                          label="Email"
                          required
                          error={mergedError}
                        >
                          <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="jane@example.com"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`${inputBase} ${inputBorder(!!mergedError)}`}
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                            {...focusProps("email")}
                          />
                        </Field>
                      );
                    }}
                  </FormField>
                </div>

                {/* Source */}
                <FormField name="source">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.source;
                    return (
                      <Field
                        id="source"
                        label="How Did You Hear About Us?"
                        required
                        error={mergedError}
                      >
                        <div className="relative">
                          <select
                            id="source"
                            name="source"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(
                                e.target.value as InquiryForm["source"],
                              )
                            }
                            className={`${inputBase} ${inputBorder(!!mergedError)} appearance-none pr-10 cursor-pointer`}
                            style={{
                              fontFamily: "var(--font-dm-sans)",
                              color: field.state.value ? "#1a1a1a" : "#999",
                            }}
                            {...focusProps("source")}
                          >
                            {sourceOptions.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                disabled={opt.value === ""}
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <span
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--brand-green)" }}
                          >
                            <ChevronDownIcon />
                          </span>
                        </div>
                      </Field>
                    );
                  }}
                </FormField>

                {/* Message */}
                <FormField name="message">
                  {(field) => {
                    const fieldError = field.state.meta.errors[0]?.message;
                    const mergedError = fieldError ?? errors.message;
                    return (
                      <Field
                        id="message"
                        label="Your Message"
                        required
                        error={mergedError}
                      >
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          placeholder="Tell us about your child, which program interests you, or any questions you have..."
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`${inputBase} ${inputBorder(!!mergedError)} resize-y min-h-27.5`}
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                          {...focusProps("message")}
                        />
                      </Field>
                    );
                  }}
                </FormField>

                {/* Submit */}
                <button
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    letterSpacing: "0.02em",
                    backgroundColor: isPending ? "#aaa" : "var(--brand-orange)",
                    boxShadow: isPending
                      ? "none"
                      : "0 4px 16px rgba(232,85,42,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPending) {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 6px 20px rgba(232,85,42,0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      isPending ? "none" : "0 4px 16px rgba(232,85,42,0.3)";
                  }}
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
