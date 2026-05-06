import type {
  CreateOneTimeSchema,
  UpdateOneTimeSchema,
} from "@subtrack/shared/schemas/one-time";

import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import prisma from "@/lib/prisma";
import { DBOneTime } from "@/modules/one-time/one-time.types";

export interface IOneTimeRepository {
  findByMonth(userId: string, month: number, year: number): Promise<DBOneTime[]>;
  findInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DBOneTime[]>;
  findById(userId: string, id: string): Promise<DBOneTime | null>;
  create(userId: string, data: CreateOneTimeSchema): Promise<DBOneTime>;
  update(
    userId: string,
    id: string,
    data: UpdateOneTimeSchema,
  ): Promise<DBOneTime | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

const toDBOneTime = (t: {
  id: string;
  name: string;
  amount: Decimal;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}): DBOneTime => ({
  id: t.id,
  name: t.name,
  amount: t.amount.toNumber(),
  category: t.category,
  date: t.date.toISOString(),
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

export class PrismaOneTimeRepository implements IOneTimeRepository {
  public async findByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<DBOneTime[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.oneTimeTransaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    });
    return transactions.map(toDBOneTime);
  }

  public async findInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DBOneTime[]> {
    const transactions = await prisma.oneTimeTransaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    });
    return transactions.map(toDBOneTime);
  }

  public async findById(
    userId: string,
    id: string,
  ): Promise<DBOneTime | null> {
    const t = await prisma.oneTimeTransaction.findFirst({
      where: { id, userId },
    });
    return t ? toDBOneTime(t) : null;
  }

  public async create(
    userId: string,
    data: CreateOneTimeSchema,
  ): Promise<DBOneTime> {
    const t = await prisma.oneTimeTransaction.create({
      data: {
        userId,
        name: data.name,
        amount: new Decimal(data.amount),
        category: data.category,
        date: data.date,
      },
    });
    return toDBOneTime(t);
  }

  public async update(
    userId: string,
    id: string,
    data: UpdateOneTimeSchema,
  ): Promise<DBOneTime | null> {
    const existing = await prisma.oneTimeTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const t = await prisma.oneTimeTransaction.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
        category: data.category,
        date: data.date,
      },
    });
    return toDBOneTime(t);
  }

  public async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.oneTimeTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.oneTimeTransaction.delete({ where: { id } });
    return true;
  }
}
