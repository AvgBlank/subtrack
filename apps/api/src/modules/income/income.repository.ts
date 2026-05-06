import type {
  CreateIncomeSchema,
  UpdateIncomeSchema,
} from "@subtrack/shared/schemas/income";

import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import prisma from "@/lib/prisma";
import { DBIncome } from "@/modules/income/income.types";

export interface IIncomeRepository {
  findAll(userId: string): Promise<DBIncome[]>;
  findById(userId: string, id: string): Promise<DBIncome | null>;
  create(userId: string, data: CreateIncomeSchema): Promise<DBIncome>;
  update(
    userId: string,
    id: string,
    data: UpdateIncomeSchema,
  ): Promise<DBIncome | null>;
  toggleStatus(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<DBIncome | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

const toDBIncome = (i: {
  id: string;
  source: string;
  amount: Decimal;
  date: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): DBIncome => ({
  id: i.id,
  source: i.source,
  amount: i.amount.toNumber(),
  date: i.date.toISOString(),
  isActive: i.isActive,
  createdAt: i.createdAt.toISOString(),
  updatedAt: i.updatedAt.toISOString(),
});

export class PrismaIncomeRepository implements IIncomeRepository {
  public async findAll(userId: string): Promise<DBIncome[]> {
    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { date: "desc" }],
    });
    return incomes.map(toDBIncome);
  }

  public async findById(
    userId: string,
    id: string,
  ): Promise<DBIncome | null> {
    const income = await prisma.income.findFirst({ where: { id, userId } });
    return income ? toDBIncome(income) : null;
  }

  public async create(
    userId: string,
    data: CreateIncomeSchema,
  ): Promise<DBIncome> {
    const income = await prisma.income.create({
      data: {
        userId,
        source: data.source,
        amount: new Decimal(data.amount),
        date: data.date,
      },
    });
    return toDBIncome(income);
  }

  public async update(
    userId: string,
    id: string,
    data: UpdateIncomeSchema,
  ): Promise<DBIncome | null> {
    const existing = await prisma.income.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const income = await prisma.income.update({
      where: { id },
      data: {
        source: data.source,
        amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
        date: data.date,
      },
    });
    return toDBIncome(income);
  }

  public async toggleStatus(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<DBIncome | null> {
    const existing = await prisma.income.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const income = await prisma.income.update({
      where: { id },
      data: { isActive },
    });
    return toDBIncome(income);
  }

  public async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.income.findFirst({ where: { id, userId } });
    if (!existing) return false;

    await prisma.income.delete({ where: { id } });
    return true;
  }
}
