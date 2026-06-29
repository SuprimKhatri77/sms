"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { APIResponse, CreateUserInput, createUserSchema } from "@repo/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import axios from "axios";
import { mapFieldErrors } from "@/utils/api";
import { Spinner } from "@/components/ui/spinner";
import {
  AdminDrawer,
  adminFieldErrorClass,
  adminFieldLabelClass,
} from "@/components/admin/admin-drawer";
import {
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: CreateUserInput["role"]; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "instructor", label: "Instructor" },
];

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [errors, setErrors] = useState<Partial<CreateUserInput>>({});
  const queryClient = useQueryClient();

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await api.post<APIResponse>("/admin/users", data);
      return res.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(result.message);
      handleClose();
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
      role: "student" as "student" | "admin" | "instructor",
    },
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: ({ value }) => {
      mutate(value);
    },
    onSubmitInvalid: ({ formApi }) => {
      formApi.validate("submit");
    },
  });

  const handleClose = () => {
    formReset();
    setErrors({});
    onClose();
  };

  return (
    <AdminDrawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title="Create User"
      description="Add a new user with name, email, password, and role"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            className={adminSecondaryButtonClass}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-user-form"
            disabled={isPending}
            className={adminPrimaryButtonClass}
          >
            {isPending ? <Spinner /> : "Create"}
          </button>
        </div>
      }
    >
      <form
        id="create-user-form"
        className="flex flex-col gap-5 px-5 py-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <FormField name="name">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors.name;
            return (
              <label htmlFor="create-name" className={adminFieldLabelClass}>
                Name
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Full name"
                  className={cn(
                    adminInputClass,
                    "normal-case tracking-normal",
                    mergedError && "border-[#9a3412]",
                  )}
                />
                {mergedError ? (
                  <span className={adminFieldErrorClass}>{mergedError}</span>
                ) : null}
              </label>
            );
          }}
        </FormField>

        <FormField name="email">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors.email;
            return (
              <label htmlFor="create-email" className={adminFieldLabelClass}>
                Email
                <input
                  id="create-email"
                  name="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="user@example.com"
                  className={cn(
                    adminInputClass,
                    "normal-case tracking-normal",
                    mergedError && "border-[#9a3412]",
                  )}
                />
                {mergedError ? (
                  <span className={adminFieldErrorClass}>{mergedError}</span>
                ) : null}
              </label>
            );
          }}
        </FormField>

        <FormField name="password">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors.password;
            return (
              <label htmlFor="create-password" className={adminFieldLabelClass}>
                Password
                <input
                  id="create-password"
                  name="password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={cn(
                    adminInputClass,
                    "normal-case tracking-normal",
                    mergedError && "border-[#9a3412]",
                  )}
                />
                {mergedError ? (
                  <span className={adminFieldErrorClass}>{mergedError}</span>
                ) : null}
              </label>
            );
          }}
        </FormField>

        <FormField name="role">
          {(field) => {
            const fieldError = field.state.meta.errors[0]?.message;
            const mergedError = fieldError ?? errors.role;
            return (
              <label htmlFor="create-role" className={adminFieldLabelClass}>
                Role
                <select
                  id="create-role"
                  name="role"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value as CreateUserInput["role"]);
                  }}
                  className={cn(
                    adminInputClass,
                    "cursor-pointer normal-case tracking-normal",
                    mergedError && "border-[#9a3412]",
                  )}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {mergedError ? (
                  <span className={adminFieldErrorClass}>{mergedError}</span>
                ) : null}
              </label>
            );
          }}
        </FormField>
      </form>
    </AdminDrawer>
  );
}
