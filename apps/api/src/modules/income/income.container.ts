import { createAuthenticate } from "@/middleware/authenticate";
import IncomeController from "@/modules/income/income.controller";
import { PrismaIncomeRepository } from "@/modules/income/income.repository";
import { IncomeService } from "@/modules/income/income.service";

export function createIncomeModule() {
  const incomeRepository = new PrismaIncomeRepository();
  const incomeService = new IncomeService(incomeRepository);
  const incomeController = new IncomeController(incomeService);
  const authenticate = createAuthenticate();

  return { incomeController, authenticate };
}
