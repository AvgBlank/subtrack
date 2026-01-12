import authFetch from "@/utils/apiFetch";
import type { MonthlySummary } from "@subtrack/shared/types/summary";

export const getSummary = async (month?: string, year?: string) => {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append("month", month);
  if (year) queryParams.append("year", year);

  const { response, data } = await authFetch(
    `/api/summary?${queryParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch sessions");
  }
  return data as MonthlySummary;
};

export const checkCanISpend = async (amount: number) => {
  const { response, data } = await authFetch(
    `/api/summary/can-i-spend?amount=${amount}`,
  );
  if (!response.ok) {
    throw new Error(data?.error || "Failed to check spending");
  }
  return data as { canSpend: boolean; remainingAfterSpend: number };
};
