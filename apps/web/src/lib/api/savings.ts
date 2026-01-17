import authFetch from "@/utils/apiFetch";

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  progressPercentage: number;
  requiredMonthlyContribution: number;
  monthsRemaining: number;
  status: "on-track" | "tight" | "at-risk";
  createdAt: string;
  updatedAt: string;
};

type CreateSavingsGoalPayload = {
  name: string;
  targetAmount: number;
  targetDate: Date;
  currentAmount: number;
};

type UpdateSavingsGoalPayload = Partial<CreateSavingsGoalPayload>;

export const getSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const { response, data } = await authFetch("/api/savings");
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch savings goals");
  }
  return data;
};

export const getSavingsGoalById = async (id: string): Promise<SavingsGoal> => {
  const { response, data } = await authFetch(`/api/savings/${id}`);
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch savings goal");
  }
  return data;
};

export const createSavingsGoal = async (
  payload: CreateSavingsGoalPayload,
): Promise<SavingsGoal> => {
  const { response, data } = await authFetch("/api/savings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to create savings goal");
  }
  return data;
};

export const updateSavingsGoal = async (
  id: string,
  payload: UpdateSavingsGoalPayload,
): Promise<SavingsGoal> => {
  const { response, data } = await authFetch(`/api/savings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update savings goal");
  }
  return data;
};

export const deleteSavingsGoal = async (id: string): Promise<void> => {
  const { response, data } = await authFetch(`/api/savings/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete savings goal");
  }
};
