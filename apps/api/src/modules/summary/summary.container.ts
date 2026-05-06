import { createAuthenticate } from "@/middleware/authenticate";
import { PrismaIncomeRepository } from "@/modules/income/income.repository";
import { PrismaOneTimeRepository } from "@/modules/one-time/one-time.repository";
import { PrismaRecurringRepository } from "@/modules/recurring/recurring.repository";
import { PrismaSavingsRepository } from "@/modules/savings/savings.repository";
import SummaryController from "@/modules/summary/summary.controller";
import { SummaryService } from "@/modules/summary/summary.service";

export function createSummaryModule() {
  // Reuse the same repository types from each module
  const incomeRepository = new PrismaIncomeRepository();
  const recurringRepository = new PrismaRecurringRepository();
  const oneTimeRepository = new PrismaOneTimeRepository();
  const savingsRepository = new PrismaSavingsRepository();

  const summaryService = new SummaryService(
    incomeRepository,
    recurringRepository,
    oneTimeRepository,
    savingsRepository,
  );
  const summaryController = new SummaryController(summaryService);
  const authenticate = createAuthenticate();

  return { summaryController, authenticate };
}
