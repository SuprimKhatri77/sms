"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

/**
 * "Apply" call to action. Only signed-in students can open the admission
 * form; everyone else gets a toast explaining why.
 */
export function ApplyButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const role = useAuthStore((state) => state.user?.role);
  const router = useRouter();

  const handleAdmissionClick = () => {
    if (!role) {
      toast.info("Please log in to access the admission form.");
      return;
    }

    if (role === "student") {
      router.push("/admission");
    } else {
      toast.info("Only student accounts can submit admission forms.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdmissionClick}
      aria-label="Apply for admission to Brew and Bake Academy"
      className={className}
    >
      {children}
    </button>
  );
}
