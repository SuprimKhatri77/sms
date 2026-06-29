"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Eye, EyeOff, Lock, Save, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { adminFieldErrorClass } from "@/components/admin/admin-drawer";
import { UserAvatar } from "@/modules/admin/users/UserAvatar";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

type ProfileErrors = { name?: string };
type PasswordErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const profileLabelClass =
  "font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.5)]";

const PASSWORD_TIPS = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "letter",
    label: "Includes a letter",
    test: (password: string) => /[a-zA-Z]/.test(password),
  },
  {
    id: "number",
    label: "Includes a number",
    test: (password: string) => /\d/.test(password),
  },
  {
    id: "case",
    label: "Mix of upper & lower case",
    test: (password: string) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: "symbol",
    label: "Includes a symbol (!@#$…)",
    test: (password: string) => /[^a-zA-Z0-9]/.test(password),
  },
] as const;

function PasswordGuidance({ password }: { password: string }) {
  const metCount = PASSWORD_TIPS.filter((tip) => tip.test(password)).length;

  return (
    <aside className="border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] p-5 lg:sticky lg:top-24">
      <p className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
        Strong password
      </p>
      <h3 className="mt-1 font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
        What makes a good password
      </h3>
      <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed text-[rgba(47,78,64,0.55)]">
        Use a unique password you do not reuse elsewhere. Avoid names, birthdays,
        or common words like &quot;password&quot;.
      </p>

      <ul className="mt-5 space-y-3">
        {PASSWORD_TIPS.map((tip) => {
          const met = tip.test(password);
          return (
            <li key={tip.id} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 grid h-4 w-4 shrink-0 place-items-center border",
                  met
                    ? "border-(--brand-green) bg-(--brand-green) text-white"
                    : "border-[rgba(47,78,64,0.2)] bg-white text-transparent",
                )}
                aria-hidden
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span
                className={cn(
                  "font-[family-name:var(--font-dm-sans)] text-sm leading-snug",
                  met ? "text-(--brand-green)" : "text-[rgba(47,78,64,0.55)]",
                )}
              >
                {tip.label}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 border-t border-[rgba(47,78,64,0.1)] pt-4 font-[family-name:var(--font-dm-sans)] text-xs leading-relaxed text-[rgba(47,78,64,0.45)]">
        {password.length === 0
          ? "Start typing your new password to see which tips you meet."
          : metCount >= 4
            ? "Looking strong — this password meets most recommendations."
            : metCount >= 2
              ? "Getting there — try adding more variety for a stronger password."
              : "Keep going — aim for at least 8 characters with letters and numbers."}
      </p>
    </aside>
  );
}

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
};

function PasswordInput({
  id,
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            adminInputClass,
            "normal-case tracking-normal pr-11",
            error && "border-[#9a3412]",
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute top-1/2 right-0 grid h-full w-11 -translate-y-1/2 cursor-pointer place-items-center text-[rgba(47,78,64,0.4)] transition-colors hover:text-(--brand-green)"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff size={16} strokeWidth={1.75} />
          ) : (
            <Eye size={16} strokeWidth={1.75} />
          )}
        </button>
      </div>
      {error ? <span className={adminFieldErrorClass}>{error}</span> : null}
    </div>
  );
}

export function AdminProfile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setImagePreview(user.imageUrl ?? null);
  }, [user]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setImagePreview(nextUrl);
  };

  const handleRemovePhoto = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProfileSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setProfileErrors({ name: "Name is required." });
      return;
    }

    setProfileErrors({});
    setUser({
      ...user,
      name: trimmedName,
      imageUrl: imagePreview ?? undefined,
    });
    toast.success("Profile updated locally.");
  };

  const handlePasswordSave = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: PasswordErrors = {};

    if (!currentPassword) {
      nextErrors.currentPassword = "Enter your current password.";
    }
    if (!newPassword) {
      nextErrors.newPassword = "Enter a new password.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      return;
    }

    setPasswordErrors({});
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(
      "Password updated locally. Changes will apply once connected to the server.",
    );
  };

  if (!user) {
    return (
      <AdminPageLayout title="Profile" description="Manage your account details.">
        <div className="border border-[rgba(47,78,64,0.18)] bg-white px-6 py-16 text-center">
          <p className="font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
            Sign in to manage your profile.
          </p>
        </div>
      </AdminPageLayout>
    );
  }

  const displayName = name.trim() || user.name;

  return (
    <AdminPageLayout
      title="Profile"
      description="Manage how you appear in the admin panel and keep your account secure."
      maxWidth="default"
    >
      <div className="space-y-8">
        <form onSubmit={handleProfileSave}>
          <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[rgba(47,78,64,0.1)] bg-[rgba(47,78,64,0.03)] px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center border border-[rgba(47,78,64,0.15)] bg-white text-(--brand-green)">
                  <UserRound size={16} strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-green)">
                    Profile & photo
                  </h2>
                  <p className="mt-0.5 max-w-md font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
                    Your name and photo show in the sidebar and across the admin
                    panel.
                  </p>
                </div>
              </div>
              <button type="submit" className={cn(adminPrimaryButtonClass, "shrink-0")}>
                <Save size={14} />
                Save profile
              </button>
            </div>

            <div className="grid gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[auto_1fr] lg:items-start">
              <div className="flex flex-col items-center gap-4 sm:items-start">
                <div className="relative">
                  {imagePreview ? (
                    <UserAvatar
                      name={displayName}
                      imageUrl={imagePreview}
                      size="lg"
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center border-2 border-[rgba(47,78,64,0.2)] bg-[rgba(47,78,64,0.06)] font-mono text-3xl font-bold text-(--brand-green)"
                      aria-hidden
                    >
                      {getInitials(displayName)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -right-1 -bottom-1 grid h-8 w-8 cursor-pointer place-items-center border border-[rgba(47,78,64,0.2)] bg-white text-(--brand-green) shadow-sm transition-colors hover:bg-[rgba(47,78,64,0.04)]"
                    aria-label="Change photo"
                  >
                    <Camera size={14} strokeWidth={1.75} />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    className={adminSecondaryButtonClass}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload photo
                  </button>
                  {imagePreview ? (
                    <button
                      type="button"
                      className={adminSecondaryButtonClass}
                      onClick={handleRemovePhoto}
                    >
                      <X size={14} />
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="flex max-w-md flex-col gap-2">
                <label htmlFor="profile-name" className={profileLabelClass}>
                  Display name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setProfileErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={cn(
                    adminInputClass,
                    "normal-case tracking-normal",
                    profileErrors.name && "border-[#9a3412]",
                  )}
                  placeholder="How you want to be shown"
                  autoComplete="name"
                />
                {profileErrors.name ? (
                  <span className={adminFieldErrorClass}>{profileErrors.name}</span>
                ) : null}
              </div>
            </div>
          </div>
        </form>

        <form onSubmit={handlePasswordSave}>
          <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[rgba(47,78,64,0.1)] bg-[rgba(47,78,64,0.03)] px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center border border-[rgba(47,78,64,0.15)] bg-white text-(--brand-green)">
                  <Lock size={16} strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-(--brand-green)">
                    Password
                  </h2>
                  <p className="mt-0.5 max-w-md font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
                    Choose a strong password. You will need your current password
                    to confirm the change.
                  </p>
                </div>
              </div>
              <button type="submit" className={cn(adminPrimaryButtonClass, "shrink-0")}>
                <Lock size={14} />
                Update password
              </button>
            </div>

            <div className="grid gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="current-password" className={profileLabelClass}>
                    Current password
                  </label>
                  <PasswordInput
                    id="current-password"
                    value={currentPassword}
                    onChange={(value) => {
                      setCurrentPassword(value);
                      setPasswordErrors((prev) => ({
                        ...prev,
                        currentPassword: undefined,
                      }));
                    }}
                    error={passwordErrors.currentPassword}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="new-password" className={profileLabelClass}>
                    New password
                  </label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={(value) => {
                      setNewPassword(value);
                      setPasswordErrors((prev) => ({
                        ...prev,
                        newPassword: undefined,
                      }));
                    }}
                    error={passwordErrors.newPassword}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm-password" className={profileLabelClass}>
                    Confirm new password
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(value) => {
                      setConfirmPassword(value);
                      setPasswordErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }}
                    error={passwordErrors.confirmPassword}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <PasswordGuidance password={newPassword} />
            </div>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
}
