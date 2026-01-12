import prisma from "@/shared/lib/db";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import type {
  CreateOneTimeSchema,
  UpdateOneTimeSchema,
} from "@subtrack/shared/schemas/one-time";
import type { OneTimeTransaction } from "@subtrack/shared/types/one-time";

export const getOneTimeByMonth = async (
  userId: string,
  month: number,
  year: number,
): Promise<OneTimeTransaction[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await prisma.oneTimeTransaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "desc" },
  });

  return transactions.map((t) => ({
    id: t.id,
    name: t.name,
    amount: t.amount.toNumber(),
    category: t.category,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
};

export const getOneTimeById = async (
  userId: string,
  id: string,
): Promise<OneTimeTransaction | null> => {
  const transaction = await prisma.oneTimeTransaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) return null;

  return {
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount.toNumber(),
    category: transaction.category,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
};

export const createOneTime = async (
  userId: string,
  data: CreateOneTimeSchema,
): Promise<OneTimeTransaction> => {
  const transaction = await prisma.oneTimeTransaction.create({
    data: {
      userId,
      name: data.name,
      amount: new Decimal(data.amount),
      category: data.category,
      date: data.date,
    },
  });

  return {
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount.toNumber(),
    category: transaction.category,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
};

export const updateOneTime = async (
  userId: string,
  id: string,
  data: UpdateOneTimeSchema,
): Promise<OneTimeTransaction | null> => {
  const existing = await prisma.oneTimeTransaction.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  const transaction = await prisma.oneTimeTransaction.update({
    where: { id },
    data: {
      name: data.name,
      amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
      category: data.category,
      date: data.date,
    },
  });

  return {
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount.toNumber(),
    category: transaction.category,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
};

export const deleteOneTime = async (
  userId: string,
  id: string,
): Promise<boolean> => {
  const existing = await prisma.oneTimeTransaction.findFirst({
    where: { id, userId },
  });

  if (!existing) return false;

  await prisma.oneTimeTransaction.delete({
    where: { id },
  });

  return true;
};
