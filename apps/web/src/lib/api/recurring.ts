import authFetch from "@/utils/apiFetch";
import type { RecurringTransaction } from "@/components/recurring/recurring-table";

type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type RecurringType = "BILL" | "SUBSCRIPTION";

type CreateRecurringPayload = {
  name: string;
  amount: number;
  type: RecurringType;
  category: string;
  frequency: RecurringFrequency;
  startDate: Date;
};

type UpdateRecurringPayload = Partial<CreateRecurringPayload>;

export const getRecurringTransactions = async (): Promise<
  RecurringTransaction[]
> => {
  const { response, data } = await authFetch("/api/recurring");
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch recurring transactions");
  }
  return data;
};

export const getRecurringById = async (
  id: string,
): Promise<RecurringTransaction> => {
  const { response, data } = await authFetch(`/api/recurring/${id}`);
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch recurring transaction");
  }
  return data;
};

export const createRecurring = async (
  payload: CreateRecurringPayload,
): Promise<RecurringTransaction> => {
  const { response, data } = await authFetch("/api/recurring", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to create recurring transaction");
  }
  return data;
};

export const updateRecurring = async (
  id: string,
  payload: UpdateRecurringPayload,
): Promise<RecurringTransaction> => {
  const { response, data } = await authFetch(`/api/recurring/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update recurring transaction");
  }
  return data;
};

export const toggleRecurringStatus = async (
  id: string,
  isActive: boolean,
): Promise<RecurringTransaction> => {
  const { response, data } = await authFetch(`/api/recurring/${id}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to toggle recurring status");
  }
  return data;
};

export const deleteRecurring = async (id: string): Promise<void> => {
  const { response, data } = await authFetch(`/api/recurring/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete recurring transaction");
  }
};
