import { Decimal } from "@prisma/client/runtime/client";
import type {
  CashFlowSummary,
  IncomeSummary,
  MonthlySummary,
  OneTimeSummary,
  RecurringSummary,
  SavingsGoalSummary,
  SavingsSummary,
} from "@subtrack/shared/types/summary";

import { IIncomeRepository } from "@/modules/income/income.repository";
import { IOneTimeRepository } from "@/modules/one-time/one-time.repository";
import { IRecurringRepository } from "@/modules/recurring/recurring.repository";
import { ISavingsRepository } from "@/modules/savings/savings.repository";
import { getDays } from "@/utils/getDays";

export interface ISummaryService {
  getRecurringSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<RecurringSummary>;
  getIncomeSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<IncomeSummary>;
  getOneTimeSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<OneTimeSummary>;
  getCashFlowSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<CashFlowSummary>;
  getSavingsSummary(userId: string): Promise<SavingsSummary>;
  getCanISpend(
    userId: string,
    amount: Decimal,
  ): Promise<{ canSpend: boolean; remainingAfterSpend: number }>;
  getMonthlySummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthlySummary>;
}

export class SummaryService implements ISummaryService {
  public constructor(
    private incomeRepository: IIncomeRepository,
    private recurringRepository: IRecurringRepository,
    private oneTimeRepository: IOneTimeRepository,
    private savingsRepository: ISavingsRepository,
  ) {}

  public async getRecurringSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<RecurringSummary> {
    const beforeDate = new Date(year, month - 1, getDays(month, year));
    const transactions = await this.recurringRepository.findAllActive(
      userId,
      beforeDate,
    );

    const bills: RecurringSummary["bills"] = transactions
      .filter((t) => t.type === "BILL")
      .map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type as "BILL" | "SUBSCRIPTION",
        category: t.category,
        frequency: t.frequency,
        originalAmount: new Decimal(t.amount),
        normalizedAmount: new Decimal(t.normalizedAmount),
        isActive: t.isActive,
      }));

    const subscriptions: RecurringSummary["subscriptions"] = transactions
      .filter((t) => t.type === "SUBSCRIPTION")
      .map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type as "BILL" | "SUBSCRIPTION",
        category: t.category,
        frequency: t.frequency,
        originalAmount: new Decimal(t.amount),
        normalizedAmount: new Decimal(t.normalizedAmount),
        isActive: t.isActive,
      }));

    const totalBills = bills.reduce(
      (sum, item) => sum.add(item.normalizedAmount),
      new Decimal(0),
    );
    const totalSubscriptions = subscriptions.reduce(
      (sum, item) => sum.add(item.normalizedAmount),
      new Decimal(0),
    );
    const total = totalBills.add(totalSubscriptions);

    const categorySummary: RecurringSummary["categorySummary"] = {};
    transactions.forEach((t) => {
      if (!categorySummary[t.category]) {
        categorySummary[t.category] = {
          count: 0,
          totalOriginalAmount: new Decimal(0),
          totalNormalizedAmount: new Decimal(0),
        };
      }
      categorySummary[t.category].count += 1;
      categorySummary[t.category].totalOriginalAmount = categorySummary[
        t.category
      ].totalOriginalAmount.add(t.amount);
      categorySummary[t.category].totalNormalizedAmount = categorySummary[
        t.category
      ].totalNormalizedAmount.add(t.normalizedAmount);
    });

    return {
      period: { month, year },
      totals: { bills: totalBills, subscriptions: totalSubscriptions, total },
      counts: { bills: bills.length, subscriptions: subscriptions.length },
      bills,
      subscriptions,
      categorySummary,
    };
  }

  public async getIncomeSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<IncomeSummary> {
    const incomes = await this.incomeRepository.findAll(userId);
    const active = incomes.filter((i) => i.isActive);

    const totalIncome = active.reduce(
      (sum, i) => sum.add(i.amount),
      new Decimal(0),
    );
    const incomeSources = active.map((i) => ({
      sourceName: i.source,
      amount: new Decimal(i.amount),
    }));

    return {
      period: { month, year },
      totalIncome,
      incomeCount: active.length,
      incomeSources,
    };
  }

  public async getOneTimeSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<OneTimeSummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, getDays(month, year));
    const transactions = await this.oneTimeRepository.findInRange(
      userId,
      startDate,
      endDate,
    );

    const totalOneTimeTransactions = transactions.reduce(
      (sum, t) => sum.add(t.amount),
      new Decimal(0),
    );

    const txList: OneTimeSummary["transactions"] = transactions.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      amount: new Decimal(t.amount),
      date: new Date(t.date),
    }));

    const categorySummary: OneTimeSummary["categorySummary"] = {};
    transactions.forEach((t) => {
      if (!categorySummary[t.category]) {
        categorySummary[t.category] = {
          count: 0,
          totalAmount: new Decimal(0),
        };
      }
      categorySummary[t.category].count += 1;
      categorySummary[t.category].totalAmount = categorySummary[
        t.category
      ].totalAmount.add(t.amount);
    });

    return {
      period: { month, year },
      totalOneTimeTransactions,
      oneTimeTransactionCount: transactions.length,
      transactions: txList,
      categorySummary,
    };
  }

  private async computeCashFlow(
    recurringSummary: RecurringSummary,
    incomeSummary: IncomeSummary,
    oneTimeSummary: OneTimeSummary,
  ): Promise<CashFlowSummary> {
    const netCashFlow = incomeSummary.totalIncome.sub(
      recurringSummary.totals.total.add(
        oneTimeSummary.totalOneTimeTransactions,
      ),
    );

    return {
      period: recurringSummary.period,
      totalRecurringExpenses: recurringSummary.totals.total,
      totalIncome: incomeSummary.totalIncome,
      totalOneTimeExpenses: oneTimeSummary.totalOneTimeTransactions,
      netCashFlow,
    };
  }

  public async getCashFlowSummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<CashFlowSummary> {
    const [recurringSummary, incomeSummary, oneTimeSummary] = await Promise.all([
      this.getRecurringSummary(userId, month, year),
      this.getIncomeSummary(userId, month, year),
      this.getOneTimeSummary(userId, month, year),
    ]);
    return this.computeCashFlow(recurringSummary, incomeSummary, oneTimeSummary);
  }

  public async getSavingsSummary(userId: string): Promise<SavingsSummary> {
    const goals = await this.savingsRepository.findAll(userId);
    const cashFlow = await this.getCashFlowSummary(
      userId,
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    );

    const savingsGoals: SavingsGoalSummary[] = goals.map((goal) => {
      const isAchievable = goal.monthsRemaining > 0;
      return {
        id: goal.id,
        name: goal.name,
        targetAmount: new Decimal(goal.targetAmount),
        currentAmount: new Decimal(goal.currentAmount),
        progressPercentage: goal.progressPercentage,
        targetDate: new Date(goal.targetDate),
        monthsRemaining: goal.monthsRemaining,
        isAchievable,
        requiredMonthlyContribution: isAchievable
          ? new Decimal(goal.requiredMonthlyContribution)
          : new Decimal(0),
      };
    });

    const totalRequiredSavings = savingsGoals.reduce(
      (sum, g) => sum.add(g.requiredMonthlyContribution),
      new Decimal(0),
    );
    const remainingAfterSavings = cashFlow.netCashFlow.sub(totalRequiredSavings);

    return {
      period: cashFlow.period,
      totalRequiredSavings,
      totalAvailableCash: cashFlow.netCashFlow,
      remainingAfterSavings,
      savingsGoals,
    };
  }

  public async getCanISpend(userId: string, amount: Decimal) {
    const savingsSummary = await this.getSavingsSummary(userId);
    const remainingAfterSpend =
      savingsSummary.remainingAfterSavings.sub(amount);
    return {
      canSpend: remainingAfterSpend.gte(0),
      remainingAfterSpend: remainingAfterSpend.toNumber(),
    };
  }

  public async getMonthlySummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthlySummary> {
    const [recurringSummary, incomeSummary, oneTimeSummary] = await Promise.all([
      this.getRecurringSummary(userId, month, year),
      this.getIncomeSummary(userId, month, year),
      this.getOneTimeSummary(userId, month, year),
    ]);

    return {
      period: { month, year },
      recurring: recurringSummary,
      income: incomeSummary,
      oneTime: oneTimeSummary,
      cashFlow: await this.computeCashFlow(
        recurringSummary,
        incomeSummary,
        oneTimeSummary,
      ),
      savings: await this.getSavingsSummary(userId),
    };
  }
}
