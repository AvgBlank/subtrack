import prisma from "@/shared/lib/db";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import type {
  CreateSavingsGoalSchema,
  UpdateSavingsGoalSchema,
} from "@subtrack/shared/schemas/savings";
import type { SavingsGoalWithProgress } from "@subtrack/shared/types/savings";

const calculateStatus = (
  progressPercentage: number,
  monthsRemaining: number,
): "on-track" | "tight" | "at-risk" => {
  if (progressPercentage >= 100) {
    return "on-track";
  }

  if (monthsRemaining <= 0) {
    return "at-risk";
  }

  const remainingPercentage = 100 - progressPercentage;
  const requiredMonthlyProgress = remainingPercentage / monthsRemaining;

  // If need more than ~15% per month, it's at-risk
  // If need between 8-15% per month, it's tight
  // Otherwise, on-track
  if (requiredMonthlyProgress > 15) {
    return "at-risk";
  } else if (requiredMonthlyProgress > 8) {
    return "tight";
  } else {
    return "on-track";
  }
};

export const getAllSavingsGoals = async (
  userId: string,
): Promise<SavingsGoalWithProgress[]> => {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { targetDate: "asc" },
  });

  return goals.map((goal) => {
    const progressPercentage = goal.currentAmount
      .div(goal.targetAmount)
      .mul(100)
      .toNumber();

    const monthsRemaining = Math.max(
      0,
      Math.ceil(
        (goal.targetDate.getFullYear() - new Date().getFullYear()) * 12 +
          (goal.targetDate.getMonth() - new Date().getMonth()),
      ),
    );

    const requiredMonthlyContribution =
      monthsRemaining > 0
        ? goal.targetAmount
            .sub(goal.currentAmount)
            .div(monthsRemaining)
            .toNumber()
        : 0;

    const status = calculateStatus(progressPercentage, monthsRemaining);

    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount.toNumber(),
      currentAmount: goal.currentAmount.toNumber(),
      targetDate: goal.targetDate.toISOString(),
      progressPercentage,
      requiredMonthlyContribution,
      monthsRemaining,
      status,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  });
};

export const getSavingsGoalById = async (
  userId: string,
  id: string,
): Promise<SavingsGoalWithProgress | null> => {
  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });

  if (!goal) return null;

  const progressPercentage = goal.currentAmount
    .div(goal.targetAmount)
    .mul(100)
    .toNumber();

  const monthsRemaining = Math.max(
    0,
    Math.ceil(
      (goal.targetDate.getFullYear() - new Date().getFullYear()) * 12 +
        (goal.targetDate.getMonth() - new Date().getMonth()),
    ),
  );

  const requiredMonthlyContribution =
    monthsRemaining > 0
      ? goal.targetAmount
          .sub(goal.currentAmount)
          .div(monthsRemaining)
          .toNumber()
      : 0;

  const status = calculateStatus(progressPercentage, monthsRemaining);

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    targetDate: goal.targetDate.toISOString(),
    progressPercentage,
    requiredMonthlyContribution,
    monthsRemaining,
    status,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
};

export const createSavingsGoal = async (
  userId: string,
  data: CreateSavingsGoalSchema,
): Promise<SavingsGoalWithProgress> => {
  const goal = await prisma.savingsGoal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: new Decimal(data.targetAmount),
      currentAmount: new Decimal(data.currentAmount),
      targetDate: data.targetDate,
    },
  });

  const progressPercentage = goal.currentAmount
    .div(goal.targetAmount)
    .mul(100)
    .toNumber();

  const monthsRemaining = Math.max(
    0,
    Math.ceil(
      (goal.targetDate.getFullYear() - new Date().getFullYear()) * 12 +
        (goal.targetDate.getMonth() - new Date().getMonth()),
    ),
  );

  const requiredMonthlyContribution =
    monthsRemaining > 0
      ? goal.targetAmount
          .sub(goal.currentAmount)
          .div(monthsRemaining)
          .toNumber()
      : 0;

  const status = calculateStatus(progressPercentage, monthsRemaining);

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    targetDate: goal.targetDate.toISOString(),
    progressPercentage,
    requiredMonthlyContribution,
    monthsRemaining,
    status,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
};

export const updateSavingsGoal = async (
  userId: string,
  id: string,
  data: UpdateSavingsGoalSchema,
): Promise<SavingsGoalWithProgress | null> => {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      name: data.name,
      targetAmount:
        data.targetAmount !== undefined
          ? new Decimal(data.targetAmount)
          : undefined,
      currentAmount:
        data.currentAmount !== undefined
          ? new Decimal(data.currentAmount)
          : undefined,
      targetDate: data.targetDate,
    },
  });

  const progressPercentage = goal.currentAmount
    .div(goal.targetAmount)
    .mul(100)
    .toNumber();

  const monthsRemaining = Math.max(
    0,
    Math.ceil(
      (goal.targetDate.getFullYear() - new Date().getFullYear()) * 12 +
        (goal.targetDate.getMonth() - new Date().getMonth()),
    ),
  );

  const requiredMonthlyContribution =
    monthsRemaining > 0
      ? goal.targetAmount
          .sub(goal.currentAmount)
          .div(monthsRemaining)
          .toNumber()
      : 0;

  const status = calculateStatus(progressPercentage, monthsRemaining);

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    targetDate: goal.targetDate.toISOString(),
    progressPercentage,
    requiredMonthlyContribution,
    monthsRemaining,
    status,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
};

export const deleteSavingsGoal = async (
  userId: string,
  id: string,
): Promise<boolean> => {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });

  if (!existing) return false;

  await prisma.savingsGoal.delete({
    where: { id },
  });

  return true;
};
