"use client";

import { useState } from "react";
import { UserAvatar } from "./UserAvatar";
import {
  APIResponse,
  UpdateUserInput,
  updateUserSchema,
  User,
} from "@repo/types";
import { mapFieldErrors } from "@/utils/api";
import axios from "axios";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useForm } from "@tanstack/react-form-nextjs";
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

interface EditUserCardProps {
  user: User | null;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: UpdateUserInput["role"]; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "instructor", label: "Instructor" },
];

export function EditUserCard({ user, onClose }: EditUserCardProps) {
  return (
    <AdminDrawer
      open={!!user}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Edit User"
      description="Update user profile and role"
    >
      {user ? <EditUserForm key={user.id} user={user} onClose={onClose} /> : null}
    </AdminDrawer>
  );
}

function EditUserForm({ user, onClose }: { user: User; onClose: () => void }) {
  const [errors, setErrors] = useState<Partial<UpdateUserInput>>({});
  const queryClient = useQueryClient();

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const res = await api.put<APIResponse>(`/admin/users/${user.id}`, data);
      return res.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
      name: user.name,
      email: user.email,
      role: user.role as "student" | "admin" | "instructor",
    },
    validators: {
      onSubmit: updateUserSchema,
    },
    onSubmit: ({ value }) => mutate(value),
    onSubmitInvalid: ({ formApi }) => {
      formApi.validate("submit");
    },
  });

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col items-center gap-3 border-b border-[rgba(47,78,64,0.12)] bg-white px-5 py-6">
        <UserAvatar
          name={user.name}
          imageUrl={user.imageUrl ?? ""}
          size="lg"
        />
        <div className="text-center">
          <p className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]">
            ID
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs break-all text-[rgba(47,78,64,0.45)]">
            {user.id}
          </p>
        </div>
        <div className="text-center">
          <p className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]">
            Joined
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.65)]">
            {joinDate}
          </p>
        </div>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex flex-col gap-5 px-5 py-5">
          <FormField name="name">
            {(field) => {
              const fieldError = field.state.meta.errors[0]?.message;
              const mergedError = fieldError ?? errors.name;
              return (
                <label htmlFor="edit-name" className={adminFieldLabelClass}>
                  Name
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                <label htmlFor="edit-email" className={adminFieldLabelClass}>
                  Email
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                <label htmlFor="edit-role" className={adminFieldLabelClass}>
                  Role
                  <select
                    id="edit-role"
                    name="role"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(
                        e.target.value as UpdateUserInput["role"],
                      );
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
        </div>

        <div className="mt-auto flex justify-end gap-2 border-t border-[rgba(47,78,64,0.12)] bg-white px-5 py-4">
          <button
            type="button"
            disabled={isPending}
            className={adminSecondaryButtonClass}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={adminPrimaryButtonClass}
          >
            {isPending ? <Spinner /> : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
