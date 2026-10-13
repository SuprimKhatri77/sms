"use client";

import { cn } from "@/lib/utils";
import { siteButton } from "@/components/site/button";
import { AuthField } from "@/components/auth/auth-field";
import Link from "next/link";
import { useForm } from "@tanstack/react-form-nextjs";
import { SignupInput, signupInputSchema, SignupResponse } from "@repo/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { APIError } from "@repo/types";
import { mapFieldErrors } from "@/utils/api";
import { Spinner } from "./ui/spinner";
import { useAuthStore } from "@/store/auth";

type SignupPayload = Omit<SignupInput, "confirmPassword">;
type FieldErrors = Partial<Record<keyof SignupPayload, string>>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [errors, setErrors] = useState<FieldErrors>();
  const router = useRouter();
  const { mutate, isPending, reset } = useMutation<
    SignupResponse,
    AxiosError<APIError>,
    SignupPayload
  >({
    mutationFn: async (data: SignupPayload) => {
      const res = await api.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: (result) => {
      const user = result.data.user;

      useAuthStore.getState().setUser(user);
      toast.success(result.message);
      router.replace(`/${user.role === "student" ? "admission" : "admin"}`);
      formReset();
      reset();
    },
    onError: (error) => {
      const data = error.response?.data;
      if (data?.errors) {
        setErrors(mapFieldErrors(data));
      }
      toast.error(data?.message ?? "An unexpected error occurred.");
      reset();
    },
  });

  const {
    Field: FormField,
    handleSubmit,
    reset: formReset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signupInputSchema,
    },

    onSubmit: ({ value }) => {
      mutate({
        email: value.email,
        name: value.name,
        password: value.password,
      });
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className={cn("w-full max-w-sm", className)}
      {...props}
    >
      <div className="mb-10 space-y-3">
        <p className="eyebrow animate-rise">Join the academy</p>
        <h1
          className="display animate-rise text-5xl text-ink sm:text-6xl"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Create your <em>account.</em>
        </h1>
        <p
          className="animate-rise text-[0.9375rem] text-ink-muted"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          You&apos;ll use it to apply for a course and follow your admission.
        </p>
      </div>

      <div className="space-y-7">
        <FormField name="name">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors?.name;
            return (
              <AuthField
                id="name"
                label="Full name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                error={mergedError}
              />
            );
          }}
        </FormField>
        <FormField name="email">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors?.email;
            return (
              <AuthField
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                error={mergedError}
                hint="We'll use this to contact you and won't share it."
              />
            );
          }}
        </FormField>

        <FormField name="password">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors?.password;
            return (
              <AuthField
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                error={mergedError}
                hint="At least 8 characters."
              />
            );
          }}
        </FormField>
        <FormField name="confirmPassword">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            return (
              <AuthField
                id="confirm-password"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                error={fieldError}
              />
            );
          }}
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          siteButton({ variant: "pine", size: "lg" }),
          "mt-10 w-full",
        )}
      >
        {isPending ? <Spinner /> : "Create account"}
      </button>

      <p className="mt-8 text-center text-[0.875rem] text-ink-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="link-underline text-ink">
          Log in
        </Link>
      </p>
    </form>
  );
}
