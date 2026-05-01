"use client";

import { useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { X } from "lucide-react";
import { UserRole } from "@/utils/mock";
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

interface EditUserCardProps {
  user: User | null;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

export function EditUserCard({ user, onClose }: EditUserCardProps) {
  const [errors, setErrors] = useState<Partial<UpdateUserInput>>({});
  const queryClient = useQueryClient();

  const { mutate, isPending, reset } = useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      console.log("userid: ", user?.id);
      const res = await api.put<APIResponse>(`/admin/users/${user?.id}`, data);
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
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role as "user" | "superadmin" | "admin",
    },
    validators: {
      onSubmit: updateUserSchema,
    },
    onSubmit: ({ value }) => mutate(value),
    onSubmitInvalid: ({ formApi }) => {
      formApi.validate("submit");
    },
  });

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-disabled={isPending}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-[rgba(47,78,64,0.22)] bg-white"
        role="complementary"
        aria-label="Edit user panel"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[rgba(47,78,64,0.16)] px-6 py-4">
          <h2 className="font-mono text-sm font-bold tracking-widest text-(--brand-green) uppercase">
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors hover:bg-[rgba(47,78,64,0.12)] hover:text-(--brand-green)"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar + meta */}
        <div className="flex flex-col items-center gap-3 border-b border-[rgba(47,78,64,0.16)] px-6 py-6">
          <UserAvatar
            name={user.name}
            imageUrl={user.imageUrl ?? ""}
            size="lg"
          />
          <div className="text-center">
            <p className="font-mono text-xs tracking-widest text-[rgba(47,78,64,0.55)] uppercase">
              ID
            </p>
            <p className="font-mono text-xs break-all text-[rgba(47,78,64,0.45)]">
              {user.id}
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs tracking-widest text-[rgba(47,78,64,0.55)] uppercase">
              Joined
            </p>
            <p className="font-mono text-xs text-[rgba(47,78,64,0.65)]">{joinDate}</p>
          </div>
        </div>

        {/* Edit form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col flex-1"
        >
          <div className="px-6 py-5 space-y-5 flex-1">
            {/* Name */}
            <FormField name="name">
              {(field) => {
                const fieldError = field.state.meta.errors[0]?.message;
                const mergedError = fieldError ?? errors.name;
                return (
                  <div>
                    <label
                      htmlFor="edit-name"
                      className="block font-mono text-xs font-semibold tracking-widest uppercase mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      id="edit-name"
                      name="name"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-none border border-[rgba(47,78,64,0.24)] px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[rgba(47,78,64,0.3)]"
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
                      htmlFor="edit-email"
                      className="block font-mono text-xs font-semibold tracking-widest uppercase mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-none border border-[rgba(47,78,64,0.24)] px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[rgba(47,78,64,0.3)]"
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
                      htmlFor="edit-role"
                      className="block font-mono text-xs font-semibold tracking-widest uppercase mb-1.5"
                    >
                      Role
                    </label>
                    <select
                      id="edit-role"
                      name="role"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(
                          e.target.value as UpdateUserInput["role"],
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
          <div className="shrink-0 flex border-t border-[rgba(47,78,64,0.16)]">
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
              {isPending ? <Spinner /> : "Save"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
