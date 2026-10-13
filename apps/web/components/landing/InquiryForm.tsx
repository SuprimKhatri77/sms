"use client";

import api from "@/lib/axios";
import { mapFieldErrors } from "@/utils/api";
import { APIResponse, type InquiryForm, inquiryFormSchema } from "@repo/types";
import { useForm } from "@tanstack/react-form-nextjs";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  CaretDownIcon,
  CheckCircleIcon,
  CheckIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react/ssr";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { siteInfo } from "@/utils/site-info";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Reveal } from "@/components/motion/reveal";
import { siteButton } from "@/components/site/button";

const sourceOptions = [
  { value: "", label: "How did you hear about us?" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Referral (Friend / Family)" },
  { value: "in_person", label: "In Person" },
];

const floatingLabelClass =
  "pointer-events-none absolute left-0 top-6 font-site text-[0.9375rem] text-ink-muted transition-all duration-300 ease-out-expo peer-focus:top-0 peer-focus:font-label peer-focus:text-[0.625rem] peer-focus:tracking-[0.16em] peer-focus:uppercase peer-focus:text-ink peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:font-label peer-[:not(:placeholder-shown)]:text-[0.625rem] peer-[:not(:placeholder-shown)]:tracking-[0.16em] peer-[:not(:placeholder-shown)]:uppercase";

const underlineFieldClass =
  "peer w-full rounded-none border-0 border-b bg-transparent px-0 pt-7 pb-3 font-site text-[0.9375rem] text-ink outline-none transition-[border-color] duration-300";

function fieldBorder(hasError: boolean) {
  return hasError
    ? "border-red-600 focus:border-red-700"
    : "border-ink/20 hover:border-ink/40 focus:border-ink";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-[0.75rem] text-red-700" role="alert">
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
          {required ? <span className="text-clay-deep"> *</span> : null}
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
          {required ? <span className="text-clay-deep"> *</span> : null}
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
          className="pointer-events-none absolute top-0 left-0 z-10 font-label text-[0.625rem] tracking-[0.16em] text-ink uppercase"
        >
          {label}
          {required ? <span className="text-clay-deep"> *</span> : null}
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
            "font-site text-[0.9375rem] outline-none transition-[border-color] duration-300",
            fieldBorder(!!error),
            open ? "border-ink" : "focus-visible:border-ink",
            value ? "text-ink" : "text-ink-muted",
          )}
        >
          <span className="min-w-0 flex-1 leading-snug">{selectedLabel}</span>
          <CaretDownIcon
            weight="light"
            className={cn(
              "size-4 shrink-0 text-ink transition-transform duration-300 ease-out-expo",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="animate-rise absolute top-[calc(100%+0.35rem)] right-0 left-0 z-50 overflow-hidden border border-hairline bg-paper shadow-[0_24px_48px_-24px_rgb(26_26_26/0.25)] [animation-duration:0.5s]"
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
                      "font-site text-[0.875rem] outline-none transition-colors duration-150 focus-visible:bg-surface",
                      isSelected
                        ? "bg-surface text-ink"
                        : "text-ink-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected ? (
                      <CheckIcon
                        weight="light"
                        className="size-4 shrink-0 text-pine"
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

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-4 border-t border-hairline py-4 last:border-b">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-[0.9375rem] text-ink">{children}</dd>
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

  const tel = siteInfo.contact.phone.replace(/\s/g, "");

  return (
    <section
      id="inquiry"
      aria-labelledby="inquiry-heading"
      className="border-t border-hairline bg-paper py-20 font-site sm:py-28"
    >
      <div className="container-page grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-16">
        {/* ── Left: Info ── */}
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">Get in touch</p>
          <h2
            id="inquiry-heading"
            className="display mt-4 text-[2.75rem] text-ink sm:text-6xl lg:text-7xl"
          >
            Have a question? <em>Let&apos;s talk.</em>
          </h2>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
            Whether you&apos;re curious about our programs, fees, or how to
            apply — send us a message and our admissions team will respond
            promptly.
          </p>

          <dl className="mt-10">
            <ContactRow label="Call us">
              <a href={`tel:${tel}`} className="link-underline outline-none">
                {siteInfo.contact.phone}
              </a>
            </ContactRow>
            <ContactRow label="Email us">
              <a
                href={`mailto:${siteInfo.contact.email}`}
                className="link-underline break-all outline-none"
              >
                {siteInfo.contact.email}
              </a>
            </ContactRow>
            <ContactRow label="Office hours">
              {siteInfo.contact.officeHours}
            </ContactRow>
            <ContactRow label="Visit">{siteInfo.contact.address}</ContactRow>
          </dl>
        </Reveal>

        {/* ── Right: Form ── */}
        <Reveal
          delay={0.1}
          className="border border-hairline bg-surface p-6 sm:p-10 lg:col-span-7"
        >
          {submitted ? (
            /* ── Success state ── */
            <div
              role="status"
              className="flex flex-col items-start gap-5 py-10 sm:py-16"
            >
              <CheckCircleIcon
                weight="light"
                className="size-12 text-pine"
                aria-hidden
              />
              <h3 className="display text-5xl text-ink">
                Inquiry <em>sent.</em>
              </h3>
              <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
                Thank you for reaching out. Our admissions team will contact you
                within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className={cn(siteButton({ variant: "outline", size: "md" }), "mt-2")}
              >
                Send another
              </button>
            </div>
          ) : (
            /* ── Form fields ── */
            <>
              <h3 className="font-display text-4xl text-ink">
                Send an inquiry
              </h3>
              <p className="mt-2 mb-8 text-[0.8125rem] text-ink-muted">
                Fields marked <span className="text-clay-deep">*</span> are
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
                  className={cn(
                    siteButton({ variant: "pine", size: "lg" }),
                    "mt-2 w-full sm:w-auto sm:self-start",
                  )}
                >
                  {isPending ? (
                    <>
                      <Spinner />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send inquiry
                      <PaperPlaneTiltIcon
                        weight="light"
                        aria-hidden
                        className="size-4 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
