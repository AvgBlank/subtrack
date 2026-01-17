import { refreshToken } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function jsonFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    credentials: "include",
  });
  const data = await response.json().catch(() => null);

  return { response, data };
}

const doFetch = (url: string, options: RequestInit = {}) => {
  const { token } = useAuthStore.getState();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return jsonFetch(url, {
    ...options,
    headers,
  });
};

const authFetch = async (url: string, options: RequestInit = {}) => {
  const {
    actions: { clearAuth, setAuth },
  } = useAuthStore.getState();

  let { response, data } = await doFetch(url, options);

  if (response.status === UNAUTHORIZED && data?.errorCode) {
    if (data.errorCode === "InvalidAccessToken") {
      const refreshResponse = await refreshToken();

      if (refreshResponse.success) {
        const { user, accessToken } = refreshResponse.data;
        setAuth(user, accessToken);

        ({ response, data } = await doFetch(url, options));
      } else {
        clearAuth();
        toast.error("Session expired, please log in again");
        redirect("/auth/login");
      }
    } else {
      clearAuth();
      toast.error("Invalid session, please log in again");
    }
  }

  return { response, data };
};
export default authFetch;
