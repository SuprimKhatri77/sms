import { dashboardPageClass } from "./dashboard-styles";
import { cn } from "@/lib/utils";

function S({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)}
    />
  );
}

export function DashboardLoadingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--brand-cream)">
      <div
        className={cn(
          dashboardPageClass,
          "px-4 py-8 sm:px-6 sm:py-10 lg:py-12",
        )}
      >
        <header className="mb-10 border-b border-[rgba(47,78,64,0.08)] pb-6">
          <S className="h-3 w-28" />
          <S className="mt-3 h-8 w-44" />
          <S className="mt-2 h-4 w-56" />
        </header>

        {children}

        <footer className="mt-14 border-t border-[rgba(47,78,64,0.08)] pt-6 text-center">
          <S className="mx-auto h-3 w-64" />
        </footer>
      </div>
    </div>
  );
}
