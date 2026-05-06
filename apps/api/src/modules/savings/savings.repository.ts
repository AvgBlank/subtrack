import type {
  CreateSavingsGoalSchema,
  UpdateSavingsGoalSchema,
} from "@subtrack/shared/schemas/savings";

import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import prisma from "@/lib/prisma";
import { DBSavingsGoal, SavingsStatus } from "@/modules/savings/savings.types";

export interface ISavingsRepository {
  findAll(userId: string): Promise<DBSavingsGoal[]>;
  findById(userId: string, id: string): Promise<DBSavingsGoal | null>;
  create(
    userId: string,
    data: CreateSavingsGoalSchema,
  ): Promise<DBSavingsGoal>;
  update(
    userId: string,
    id: string,
    data: UpdateSavingsGoalSchema,
  ): Promise<DBSavingsGoal | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

const calculateStatus = (
  progressPercentage: number,
  monthsRemaining: number,
): SavingsStatus => {
  if (progressPercentage >= 100) return "on-track";
  if (monthsRemaining <= 0) return "at-risk";

  const remainingPercentage = 100 - progressPercentage;
  const requiredMonthlyProgress = remainingPercentage / monthsRemaining;

  if (requiredMonthlyProgress > 15) return "at-risk";
  if (requiredMonthlyProgress > 8) return "tight";
  return "on-track";
};

const toDBSavingsGoal = (goal: {
  id: string;
  name: string;
  targetAmount: Decimal;
  currentAmount: Decimal;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}): DBSavingsGoal => {
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

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    targetDate: goal.targetDate.toISOString(),
    progressPercentage,
    requiredMonthlyContribution,
    monthsRemaining,
    status: calculateStatus(progressPercentage, monthsRemaining),
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
};

export class PrismaSavingsRepository implements ISavingsRepository {
  public async findAll(userId: string): Promise<DBSavingsGoal[]> {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { targetDate: "asc" },
    });
    return goals.map(toDBSavingsGoal);
  }

  public async findById(
    userId: string,
    id: string,
  ): Promise<DBSavingsGoal | null> {
    const goal = await prisma.savingsGoal.findFirst({ where: { id, userId } });
    return goal ? toDBSavingsGoal(goal) : null;
  }

  public async create(
    userId: string,
    data: CreateSavingsGoalSchema,
  ): Promise<DBSavingsGoal> {
    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: new Decimal(data.targetAmount),
        currentAmount: new Decimal(data.currentAmount),
        targetDate: data.targetDate,
      },
    });
    return toDBSavingsGoal(goal);
  }

  public async update(
    userId: string,
    id: string,
    data: UpdateSavingsGoalSchema,
  ): Promise<DBSavingsGoal | null> {
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
    return toDBSavingsGoal(goal);
  }

  public async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.savingsGoal.delete({ where: { id } });
    return true;
  }
}
