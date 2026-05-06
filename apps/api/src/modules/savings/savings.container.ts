import { createAuthenticate } from "@/middleware/authenticate";
import SavingsController from "@/modules/savings/savings.controller";
import { PrismaSavingsRepository } from "@/modules/savings/savings.repository";
import { SavingsService } from "@/modules/savings/savings.service";

export function createSavingsModule() {
  const savingsRepository = new PrismaSavingsRepository();
  const savingsService = new SavingsService(savingsRepository);
  const savingsController = new SavingsController(savingsService);
  const authenticate = createAuthenticate();

  return { savingsController, authenticate };
}
