import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  avatar?: string;
}

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserData, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: "auth-storage" }
  )
);
