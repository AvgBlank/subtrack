const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
import { useAuthStore } from "@/store/auth-store";
import { UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const safeJson = async (response: Response) => {
  return response.json().catch(() => null);
};

export async function jsonFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    credentials: "include",
  });
  const data = await safeJson(response);

  return { response, data };
}

export default async function apiFetch(url: string, options: RequestInit = {}) {
  const {
    actions: { clearAuth },
  } = useAuthStore.getState();
  const response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    credentials: "include",
  });
  const data = await safeJson(response);
  if (response.status === UNAUTHORIZED && data.errorCode === "AuthError") {
    clearAuth();
    toast.error("Session expired. Please log in again.");
    redirect("/auth/login");
  }
  return { response, data };
}
