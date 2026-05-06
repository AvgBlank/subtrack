import type {
  CreateRecurringSchema,
  UpdateRecurringSchema,
} from "@subtrack/shared/schemas/recurring";

import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import prisma from "@/lib/prisma";
import { DBRecurring } from "@/modules/recurring/recurring.types";
import { normalizeToMonthly } from "@/utils/normalize";

export interface IRecurringRepository {
  findAll(userId: string): Promise<DBRecurring[]>;
  findAllActive(userId: string, beforeDate: Date): Promise<DBRecurring[]>;
  findById(userId: string, id: string): Promise<DBRecurring | null>;
  create(userId: string, data: CreateRecurringSchema): Promise<DBRecurring>;
  update(
    userId: string,
    id: string,
    data: UpdateRecurringSchema,
  ): Promise<DBRecurring | null>;
  toggleStatus(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<DBRecurring | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

const toDBRecurring = (t: {
  id: string;
  name: string;
  amount: Decimal;
  type: string;
  category: string;
  frequency: string;
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): DBRecurring => ({
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
});

export class PrismaRecurringRepository implements IRecurringRepository {
  public async findAll(userId: string): Promise<DBRecurring[]> {
    const transactions = await prisma.recurringTransactions.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { amount: "desc" }],
    });
    return transactions.map(toDBRecurring);
  }

  public async findAllActive(
    userId: string,
    beforeDate: Date,
  ): Promise<DBRecurring[]> {
    const transactions = await prisma.recurringTransactions.findMany({
      where: { userId, isActive: true, startDate: { lte: beforeDate } },
    });
    return transactions.map(toDBRecurring);
  }

  public async findById(
    userId: string,
    id: string,
  ): Promise<DBRecurring | null> {
    const t = await prisma.recurringTransactions.findFirst({
      where: { id, userId },
    });
    return t ? toDBRecurring(t) : null;
  }

  public async create(
    userId: string,
    data: CreateRecurringSchema,
  ): Promise<DBRecurring> {
    const t = await prisma.recurringTransactions.create({
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
    return toDBRecurring(t);
  }

  public async update(
    userId: string,
    id: string,
    data: UpdateRecurringSchema,
  ): Promise<DBRecurring | null> {
    const existing = await prisma.recurringTransactions.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const t = await prisma.recurringTransactions.update({
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
    return toDBRecurring(t);
  }

  public async toggleStatus(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<DBRecurring | null> {
    const existing = await prisma.recurringTransactions.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const t = await prisma.recurringTransactions.update({
      where: { id },
      data: { isActive },
    });
    return toDBRecurring(t);
  }

  public async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.recurringTransactions.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.recurringTransactions.delete({ where: { id } });
    return true;
  }
}
