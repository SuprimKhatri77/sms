"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "@tanstack/react-form-nextjs";
import { APIResponse, CreateUserInput, createUserSchema } from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import axios from "axios";
import { mapFieldErrors } from "@/utils/api";
import { Spinner } from "@/components/ui/spinner";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: CreateUserInput["role"]; label: string }[] = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [errors, setErrors] = useState<Partial<CreateUserInput>>({});

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await api.post<APIResponse>("/admin/users", data);
      return res.data;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      onClose();
      formReset();
      setErrors({});
      reset();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as APIResponse;
        if (data.errors) {
          setErrors(mapFieldErrors(data));
        }
      }
      toast.error(error.message || "Something went wrong");
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
      role: "user" as "user" | "superadmin" | "admin",
    },
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: ({ value }) => {
      console.log("SUBMIT CALLED", value);
      mutate(value);
    },
    onSubmitInvalid: ({ formApi }) => {
      formApi.validate("submit");
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-user-title"
    >
      <div className="w-full max-w-md border border-[rgba(47,78,64,0.22)] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(47,78,64,0.16)] px-6 py-4">
          <h2 id="create-user-title" className="font-mono text-sm font-bold tracking-widest text-(--brand-green) uppercase">
            Create User
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors hover:bg-[rgba(47,78,64,0.12)] hover:text-(--brand-green)"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="px-6 py-5 space-y-5">
            {/* Name */}
            <FormField name="name">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.name;
                return (
                  <div>
                    <label
                      htmlFor="create-name"
                      className="block font-mono text-xs font-semibold tracking-widest uppercase mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      id="create-name"
                      name="name"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-none border border-[rgba(47,78,64,0.24)] px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[rgba(47,78,64,0.3)] focus:ring-offset-0 placeholder:text-[rgba(47,78,64,0.35)]"
                    />
                    {mergedError && (
                      <p className="mt-1 text-xs font-mono text-red-600">
                        {mergedError}
                      </p>
                    )}
                  </div>
                );
              }}
            </FormField>

            {/* Email */}
            <FormField name="email">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.email;
                return (
                  <div>
                    <label
                      htmlFor="create-email"
                      className="block font-mono text-xs font-semibold tracking-widest uppercase mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="create-email"
                      name="email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full rounded-none border border-[rgba(47,78,64,0.24)] px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[rgba(47,78,64,0.3)] focus:ring-offset-0 placeholder:text-[rgba(47,78,64,0.35)]"
                    />
                    {mergedError && (
                      <p className="mt-1 text-xs font-mono text-red-600">
                        {mergedError}
                      </p>
                    )}
                  </div>
                );
              }}
            </FormField>

            {/* Password */}
            <FormField name="password">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.password;
                return (
                  <div>
                    <label
                      htmlFor="create-password"
                      className="block font-mono text-xs font-semibold tracking-widest uppercase mb-1.5"
                    >
                      Password
                    </label>
                    <input
                      id="create-password"
                      name="password"
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-none border border-[rgba(47,78,64,0.24)] px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[rgba(47,78,64,0.3)] focus:ring-offset-0 placeholder:text-[rgba(47,78,64,0.35)]"
                    />
                    {mergedError && (
                      <p className="mt-1 text-xs font-mono text-red-600">
                        {mergedError}
                      </p>
                    )}
                  </div>
                );
              }}
            </FormField>

            {/* Role */}
            <FormField name="role">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.role;
                return (
                  <div>
                    <label
                      htmlFor="create-role"
                      className="block font-mono text-xs font-semibold tracking-widest uppercase mb-1.5"
                    >
                      Role
                    </label>
                    <select
                      id="create-role"
                      name="role"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(
                          e.target.value as CreateUserInput["role"],
                        );
                      }}
                      className="w-full cursor-pointer rounded-none border border-[rgba(47,78,64,0.24)] bg-white px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[rgba(47,78,64,0.3)]"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {mergedError && (
                      <p className="mt-1 text-xs font-mono text-red-600">
                        {mergedError}
                      </p>
                    )}
                  </div>
                );
              }}
            </FormField>
          </div>

          {/* Footer */}
          <div className="flex gap-0 border-t border-[rgba(47,78,64,0.16)]">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="flex-1 border-r border-[rgba(47,78,64,0.16)] py-3 font-mono text-xs font-semibold tracking-widest text-(--brand-green) uppercase transition-colors hover:bg-[rgba(47,78,64,0.06)]"
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              type="submit"
              className="flex flex-1 items-center justify-center bg-(--brand-green) py-3 font-mono text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-(--brand-green-2)"
            >
              {isPending ? <Spinner /> : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
