"use client";

import { cn } from "@/lib/utils";
import { siteButton } from "@/components/site/button";
import { AuthField } from "@/components/auth/auth-field";
import { useForm } from "@tanstack/react-form-nextjs";
import {
  APIError,
  LoginInput,
  loginInputSchema,
  LoginResponse,
} from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { mapFieldErrors } from "@/utils/api";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [errors, setErrors] = useState<FieldErrors>();
  const router = useRouter();
  const { mutate, isPending, reset } = useMutation<
    Extract<LoginResponse, { success: true }>,
    AxiosError<APIError>,
    LoginInput
  >({
    mutationFn: async (data) => {
      const res = await api.post<Extract<LoginResponse, { success: true }>>(
        "/auth/login",
        data,
      );
      return res.data;
    },
    onSuccess: (result) => {
      const user = result.data.user;

      useAuthStore.getState().setUser(user);

      toast.success(result.message);
      router.replace(`/${result.data.user.role === "student" ? "" : "admin"}`);
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
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginInputSchema,
    },

    onSubmit: ({ value }) => mutate(value),
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
        <p className="eyebrow animate-rise">Welcome back</p>
        <h1
          className="display animate-rise text-5xl text-ink sm:text-6xl"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Log <em>in.</em>
        </h1>
        <p
          className="animate-rise text-[0.9375rem] text-ink-muted"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Enter your email and password to continue.
        </p>
      </div>

      <div className="space-y-7">
        <FormField name="email">
          {(field) => {
            const error = field.state.meta.errors[0]?.message;
            const mergedError = error ?? errors?.email;
            return (
              <AuthField
                id="email"
                label="Email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                required
                error={mergedError}
              />
            );
          }}
        </FormField>
        <FormField name="password">
          {(field) => {
            const error = field.state.meta.errors[0]?.message;
            const mergedError = error ?? errors?.password;
            return (
              <AuthField
                id="password"
                label="Password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                error={mergedError}
              />
            );
          }}
        </FormField>
      </div>

      <button
        disabled={isPending}
        type="submit"
        className={cn(
          siteButton({ variant: "pine", size: "lg" }),
          "mt-10 w-full",
        )}
      >
        {isPending ? <Spinner /> : "Log in"}
      </button>

      <p className="mt-8 text-center text-[0.875rem] text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="link-underline text-ink">
          Sign up
        </Link>
      </p>
    </form>
  );
}
