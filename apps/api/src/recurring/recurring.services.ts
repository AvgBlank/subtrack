import prisma from "@/shared/lib/db";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import type {
  CreateRecurringSchema,
  UpdateRecurringSchema,
} from "@subtrack/shared/schemas/recurring";
import type { RecurringTransaction } from "@subtrack/shared/types/recurring";

const normalizeToMonthly = (amount: Decimal, frequency: string): number => {
  if (frequency === "DAILY") {
    return amount.mul(365).div(12).toNumber();
  } else if (frequency === "WEEKLY") {
    return amount.mul(52).div(12).toNumber();
  } else if (frequency === "YEARLY") {
    return amount.div(12).toNumber();
  } else {
    return amount.toNumber();
  }
};

export const getAllRecurring = async (
  userId: string,
): Promise<RecurringTransaction[]> => {
  const transactions = await prisma.recurringTransactions.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { amount: "desc" }],
  });

  return transactions.map((t) => ({
    id: t.id,
    name: t.name,
    amount: t.amount.toNumber(),
    type: t.type,
    category: t.category,
    frequency: t.frequency,
    startDate: t.startDate.toISOString(),
    isActive: t.isActive,
    normalizedAmount: normalizeToMonthly(t.amount, t.frequency),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
};

export const getRecurringById = async (
  userId: string,
  id: string,
): Promise<RecurringTransaction | null> => {
  const transaction = await prisma.recurringTransactions.findFirst({
    where: { id, userId },
  });

  if (!transaction) return null;

  return {
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount.toNumber(),
    type: transaction.type,
    category: transaction.category,
    frequency: transaction.frequency,
    startDate: transaction.startDate.toISOString(),
    isActive: transaction.isActive,
    normalizedAmount: normalizeToMonthly(
      transaction.amount,
      transaction.frequency,
    ),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
};

export const createRecurring = async (
  userId: string,
  data: CreateRecurringSchema,
): Promise<RecurringTransaction> => {
  const transaction = await prisma.recurringTransactions.create({
    data: {
      userId,
      name: data.name,
      amount: new Decimal(data.amount),
      type: data.type,
      category: data.category,
      frequency: data.frequency,
      startDate: data.startDate,
    },
  });

  return {
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount.toNumber(),
    type: transaction.type,
    category: transaction.category,
    frequency: transaction.frequency,
    startDate: transaction.startDate.toISOString(),
    isActive: transaction.isActive,
    normalizedAmount: normalizeToMonthly(
      transaction.amount,
      transaction.frequency,
    ),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
};

export const updateRecurring = async (
  userId: string,
  id: string,
  data: UpdateRecurringSchema,
): Promise<RecurringTransaction | null> => {
  const existing = await prisma.recurringTransactions.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  const transaction = await prisma.recurringTransactions.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.amount && { amount: new Decimal(data.amount) }),
      ...(data.type && { type: data.type }),
      ...(data.category && { category: data.category }),
      ...(data.frequency && { frequency: data.frequency }),
      ...(data.startDate && { startDate: data.startDate }),
    },
  });

  return {
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount.toNumber(),
    type: transaction.type,
    category: transaction.category,
    frequency: transaction.frequency,
    startDate: transaction.startDate.toISOString(),
    isActive: transaction.isActive,
    normalizedAmount: normalizeToMonthly(
      transaction.amount,
      transaction.frequency,
    ),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
};

export const toggleRecurringStatus = async (
  userId: string,
  id: string,
  isActive: boolean,
): Promise<RecurringTransaction | null> => {
  const existing = await prisma.recurringTransactions.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  const transaction = await prisma.recurringTransactions.update({
    where: { id },
    data: { isActive },
  });

  return {
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount.toNumber(),
    type: transaction.type,
    category: transaction.category,
    frequency: transaction.frequency,
    startDate: transaction.startDate.toISOString(),
    isActive: transaction.isActive,
    normalizedAmount: normalizeToMonthly(
      transaction.amount,
      transaction.frequency,
    ),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
};

export const deleteRecurring = async (
  userId: string,
  id: string,
): Promise<boolean> => {
  const existing = await prisma.recurringTransactions.findFirst({
    where: { id, userId },
  });

  if (!existing) return false;

  await prisma.recurringTransactions.delete({
    where: { id },
  });

  return true;
};
