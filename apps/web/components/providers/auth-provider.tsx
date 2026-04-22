"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import type { User } from "@repo/types";

export function AuthProvider({ user }: { user: User | null }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!user) return;
    setUser(user);
  }, [user]);

  return null;
}
