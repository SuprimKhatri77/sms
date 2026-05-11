"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form-nextjs";
import { LoginInput, loginInputSchema, LoginResponse } from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, mapFieldErrors } from "@/utils/api";
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
    AxiosError<ApiError>,
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
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <FormField name="email">
          {(field) => {
            const error = field.state.meta.errors[0]?.message;
            const mergedError = error ?? errors?.email;
            return (
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                  placeholder="m@example.com"
                  required
                />

                {mergedError && <FieldError>{mergedError}</FieldError>}
              </Field>
            );
          }}
        </FormField>
        <FormField name="password">
          {(field) => {
            const error = field.state.meta.errors[0]?.message;
            const mergedError = error ?? errors?.password;
            return (
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  required
                />

                {mergedError && <FieldError>{mergedError}</FieldError>}
              </Field>
            );
          }}
        </FormField>
        <Field>
          <Button
            disabled={isPending}
            type="submit"
            className="rounded-none bg-[#c28a4f]"
          >
            {isPending ? <Spinner /> : "Login"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
