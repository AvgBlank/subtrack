import apiFetch from "@/utils/apiFetch";

export type Income = {
  id: string;
  source: string;
  amount: number;
  date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateIncomePayload = {
  source: string;
  amount: number;
  date: Date;
};

type UpdateIncomePayload = Partial<CreateIncomePayload>;

export const getIncomes = async (): Promise<Income[]> => {
  const { response, data } = await apiFetch("/api/income");
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch income");
  }
  return data;
};

export const getIncomeById = async (id: string): Promise<Income> => {
  const { response, data } = await apiFetch(`/api/income/${id}`);
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch income");
  }
  return data;
};

export const createIncome = async (
  payload: CreateIncomePayload,
): Promise<Income> => {
  const { response, data } = await apiFetch("/api/income", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to create income");
  }
  return data;
};

export const updateIncome = async (
  id: string,
  payload: UpdateIncomePayload,
): Promise<Income> => {
  const { response, data } = await apiFetch(`/api/income/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update income");
  }
  return data;
};

export const toggleIncomeStatus = async (
  id: string,
  isActive: boolean,
): Promise<Income> => {
  const { response, data } = await apiFetch(`/api/income/${id}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to toggle income status");
  }
  return data;
};

export const deleteIncome = async (id: string): Promise<void> => {
  const { response, data } = await apiFetch(`/api/income/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete income");
  }
};
