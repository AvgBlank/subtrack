import { create } from "zustand";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setToken: (token: string | null) => void;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  actions: AuthActions;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,

  actions: {
    setAuth: (user, token) =>
      set({
        user,
        token,
      }),

    clearAuth: () =>
      set({
        user: null,
        token: null,
      }),

    setToken: (token) =>
      set({
        token,
      }),
  },
}));

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.token);

export const useRequiredAuthUser = () => useAuthStore((state) => state.user!);
export const useRequiredAuthToken = () => useAuthStore((state) => state.token!);

export const useAuthActions = () => useAuthStore((state) => state.actions);
