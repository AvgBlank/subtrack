import prisma from "@/shared/lib/db";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import type {
  CreateIncomeSchema,
  UpdateIncomeSchema,
} from "@subtrack/shared/schemas/income";
import type { Income } from "@subtrack/shared/types/income";

export const getAllIncome = async (userId: string): Promise<Income[]> => {
  const incomes = await prisma.income.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { date: "desc" }],
  });

  return incomes.map((i) => ({
    id: i.id,
    source: i.source,
    amount: i.amount.toNumber(),
    date: i.date.toISOString(),
    isActive: i.isActive,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));
};

export const getIncomeById = async (
  userId: string,
  id: string,
): Promise<Income | null> => {
  const income = await prisma.income.findFirst({
    where: { id, userId },
  });

  if (!income) return null;

  return {
    id: income.id,
    source: income.source,
    amount: income.amount.toNumber(),
    date: income.date.toISOString(),
    isActive: income.isActive,
    createdAt: income.createdAt.toISOString(),
    updatedAt: income.updatedAt.toISOString(),
  };
};

export const createIncome = async (
  userId: string,
  data: CreateIncomeSchema,
): Promise<Income> => {
  const income = await prisma.income.create({
    data: {
      userId,
      source: data.source,
      amount: new Decimal(data.amount),
      date: data.date,
    },
  });

  return {
    id: income.id,
    source: income.source,
    amount: income.amount.toNumber(),
    date: income.date.toISOString(),
    isActive: income.isActive,
    createdAt: income.createdAt.toISOString(),
    updatedAt: income.updatedAt.toISOString(),
  };
};

export const updateIncome = async (
  userId: string,
  id: string,
  data: UpdateIncomeSchema,
): Promise<Income | null> => {
  const existing = await prisma.income.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  const income = await prisma.income.update({
    where: { id },
    data: {
      source: data.source,
      amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
      date: data.date,
    },
  });

  return {
    id: income.id,
    source: income.source,
    amount: income.amount.toNumber(),
    date: income.date.toISOString(),
    isActive: income.isActive,
    createdAt: income.createdAt.toISOString(),
    updatedAt: income.updatedAt.toISOString(),
  };
};

export const toggleIncomeStatus = async (
  userId: string,
  id: string,
  isActive: boolean,
): Promise<Income | null> => {
  const existing = await prisma.income.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  const income = await prisma.income.update({
    where: { id },
    data: { isActive },
  });

  return {
    id: income.id,
    source: income.source,
    amount: income.amount.toNumber(),
    date: income.date.toISOString(),
    isActive: income.isActive,
    createdAt: income.createdAt.toISOString(),
    updatedAt: income.updatedAt.toISOString(),
  };
};

export const deleteIncome = async (
  userId: string,
  id: string,
): Promise<boolean> => {
  const existing = await prisma.income.findFirst({
    where: { id, userId },
  });

  if (!existing) return false;

  await prisma.income.delete({
    where: { id },
  });

  return true;
};
