import { create } from "zustand";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthActions {
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}

interface AuthStore {
  user: AuthUser | null;
  actions: AuthActions;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,

  actions: {
    setAuth: (user) =>
      set({
        user,
      }),

    clearAuth: () =>
      set({
        user: null,
      }),
  },
}));

export const useAuthUser = () => useAuthStore((state) => state.user);

export const useRequiredAuthUser = () => useAuthStore((state) => state.user!);

export const useAuthActions = () => useAuthStore((state) => state.actions);
