import {
  adminFieldErrorClass,
  adminFieldLabelClass,
} from "@/components/admin/admin-drawer";

export function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className={adminFieldLabelClass}>
      <span>
        {label}
        {required ? (
          <span className="ml-0.5 normal-case tracking-normal text-[#9a3412]">
            *
          </span>
        ) : null}
      </span>
      {children}
      {hint ? (
        <span className="font-[family-name:var(--font-dm-sans)] text-xs font-normal normal-case tracking-normal text-[rgba(47,78,64,0.45)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export { adminFieldErrorClass };
