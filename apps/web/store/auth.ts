import { JWTUser } from "@repo/types";
import { create } from "zustand";

interface AuthStore {
  user: JWTUser | null;
  setUser: (user: JWTUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
