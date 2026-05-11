import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "@tanstack/react-form-nextjs";
import { SignupInput, signupInputSchema, SignupResponse } from "@repo/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiError } from "@repo/types/base";
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
    AxiosError<ApiError>,
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
      router.replace(`/${user.role === "student" ? "/dashboard" : "admin"}`);
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
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <FormField name="name">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors?.name;
            return (
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className="bg-background"
                />
                {mergedError && <FieldError>{mergedError}</FieldError>}
              </Field>
            );
          }}
        </FormField>
        <FormField name="email">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors?.email;
            return (
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className="bg-background"
                />
                {mergedError && <FieldError>{mergedError}</FieldError>}
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>
            );
          }}
        </FormField>

        <FormField name="password">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors?.password;
            return (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  required
                  className="bg-background"
                />
                {mergedError && <FieldError>{mergedError}</FieldError>}
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
            );
          }}
        </FormField>
        <FormField name="confirmPassword">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            return (
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className="bg-background"
                />
                <FieldDescription>
                  Please confirm your password.
                </FieldDescription>
                {fieldError && <FieldError>{fieldError}</FieldError>}
              </Field>
            );
          }}
        </FormField>
        <Field>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-none bg-[#c28a4f]"
          >
            {isPending ? <Spinner /> : "Create Account"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
