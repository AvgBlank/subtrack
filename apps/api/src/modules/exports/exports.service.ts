import { IExportRepository } from "@/modules/exports/exports.repository";
import { MonthRange } from "@/modules/exports/exports.types";
import { arrayToCSV } from "@/utils/csv";

export interface IExportService {
  getMonthlySummaryCSV(userId: string, range: MonthRange): Promise<string>;
  getRecurringCSV(userId: string): Promise<string>;
  getOneTimeCSV(userId: string, range: MonthRange): Promise<string>;
  getIncomeCSV(userId: string): Promise<string>;
  getFullCSV(userId: string, range: MonthRange): Promise<string>;
}

export class ExportService implements IExportService {
  public constructor(private exportRepository: IExportRepository) {}

  public async getMonthlySummaryCSV(
    userId: string,
    range: MonthRange,
  ): Promise<string> {
    const data = await this.exportRepository.getMonthlySummaryData(
      userId,
      range,
    );
    return arrayToCSV(data, [
      { key: "month", label: "Month" },
      { key: "year", label: "Year" },
      { key: "income", label: "Income" },
      { key: "recurringExpenses", label: "Recurring Expenses" },
      { key: "oneTimeExpenses", label: "One-time Expenses" },
      { key: "totalExpenses", label: "Total Expenses" },
      { key: "savingsRequired", label: "Savings Required" },
      { key: "remainingCash", label: "Remaining Cash" },
    ]);
  }

  public async getRecurringCSV(userId: string): Promise<string> {
    const data = await this.exportRepository.getRecurringData(userId);
    return arrayToCSV(data, [
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "category", label: "Category" },
      { key: "frequency", label: "Frequency" },
      { key: "amount", label: "Amount" },
      { key: "normalizedMonthlyAmount", label: "Monthly Amount" },
      { key: "status", label: "Status" },
    ]);
  }

  public async getOneTimeCSV(
    userId: string,
    range: MonthRange,
  ): Promise<string> {
    const data = await this.exportRepository.getOneTimeData(userId, range);
    return arrayToCSV(data, [
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "amount", label: "Amount" },
      { key: "date", label: "Date" },
    ]);
  }

  public async getIncomeCSV(userId: string): Promise<string> {
    const data = await this.exportRepository.getIncomeData(userId);
    return arrayToCSV(data, [
      { key: "source", label: "Source" },
      { key: "amount", label: "Amount" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
    ]);
  }

  public async getFullCSV(
    userId: string,
    range: MonthRange,
  ): Promise<string> {
    const [monthlySummary, recurring, oneTime, income] = await Promise.all([
      this.exportRepository.getMonthlySummaryData(userId, range),
      this.exportRepository.getRecurringData(userId),
      this.exportRepository.getOneTimeData(userId, range),
      this.exportRepository.getIncomeData(userId),
    ]);

    const sections: string[] = [];

    if (monthlySummary.length > 0) {
      sections.push("=== MONTHLY SUMMARY ===");
      sections.push(await this.getMonthlySummaryCSV(userId, range));
    }
    if (recurring.length > 0) {
      sections.push("\n=== RECURRING TRANSACTIONS ===");
      sections.push(await this.getRecurringCSV(userId));
    }
    if (oneTime.length > 0) {
      sections.push("\n=== ONE-TIME TRANSACTIONS ===");
      sections.push(await this.getOneTimeCSV(userId, range));
    }
    if (income.length > 0) {
      sections.push("\n=== INCOME ===");
      sections.push(await this.getIncomeCSV(userId));
    }

    return sections.join("\n");
  }
}
