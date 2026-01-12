import apiFetch from "@/utils/apiFetch";

export type OneTimeTransaction = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

type CreateOneTimePayload = {
  name: string;
  amount: number;
  category: string;
  date: Date;
};

type UpdateOneTimePayload = Partial<CreateOneTimePayload>;

export const getOneTimeTransactions = async (
  month: number,
  year: number,
): Promise<OneTimeTransaction[]> => {
  const { response, data } = await apiFetch(
    `/api/one-time?month=${month}&year=${year}`,
  );
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch one-time transactions");
  }
  return data;
};

export const getOneTimeById = async (
  id: string,
): Promise<OneTimeTransaction> => {
  const { response, data } = await apiFetch(`/api/one-time/${id}`);
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch one-time transaction");
  }
  return data;
};

export const createOneTime = async (
  payload: CreateOneTimePayload,
): Promise<OneTimeTransaction> => {
  const { response, data } = await apiFetch("/api/one-time", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to create one-time transaction");
  }
  return data;
};

export const updateOneTime = async (
  id: string,
  payload: UpdateOneTimePayload,
): Promise<OneTimeTransaction> => {
  const { response, data } = await apiFetch(`/api/one-time/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update one-time transaction");
  }
  return data;
};

export const deleteOneTime = async (id: string): Promise<void> => {
  const { response, data } = await apiFetch(`/api/one-time/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete one-time transaction");
  }
};
