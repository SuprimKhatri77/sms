import { PackageOpen } from "lucide-react";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <PackageOpen
        className="h-10 w-10 text-[rgba(47,78,64,0.2)]"
        strokeWidth={1.25}
      />
      <p className="max-w-sm font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.45)]">
        {message}
      </p>
    </div>
  );
}
