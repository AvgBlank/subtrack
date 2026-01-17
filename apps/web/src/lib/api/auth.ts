import authFetch, { jsonFetch } from "@/utils/apiFetch";
import { UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";
import type {
  LoginSchema,
  RegisterSchema,
} from "@subtrack/shared/schemas/auth";

type AuthResponse =
  | {
      success: true;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          picture: string;
        };
        accessToken: string;
      };
    }
  | {
      success: false;
      message: string;
    };

export const verifyAuth = async (): Promise<AuthResponse> => {
  try {
    const { response, data } = await authFetch("/api/auth/verify", {
      cache: "no-store",
    });
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, message: "Not authenticated" };
  } catch {
    return { success: false, message: "Not authenticated" };
  }
};

export const register = async (
  values: RegisterSchema,
): Promise<AuthResponse> => {
  try {
    const { response, data } = await jsonFetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      return {
        success: false,
        message: data.error || "Registration failed",
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Registration failed" };
  }
};

export const login = async (values: LoginSchema): Promise<AuthResponse> => {
  try {
    const { response, data } = await jsonFetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      return {
        success: false,
        message: data.error || "Login failed",
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Login failed" };
  }
};

export const googleOAuth = async (
  code: string | null,
): Promise<AuthResponse> => {
  try {
    if (!code) {
      return {
        success: false,
        message: "OAuth Error",
      };
    }
    const { response, data } = await jsonFetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      return {
        success: false,
        message: data.error || "OAuth Error",
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "OAuth Error" };
  }
};

export const logout = async (): Promise<{ success: true }> => {
  try {
    await authFetch("/api/auth/logout", {
      method: "DELETE",
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: true };
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const { response, data } = await jsonFetch("/api/auth/refresh");
    if (response.status === UNAUTHORIZED || !response.ok) {
      return { success: false, message: data.error };
    }
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Token refresh failed" };
  }
};
