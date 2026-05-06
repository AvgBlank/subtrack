import { createAuthenticate } from "@/middleware/authenticate";
import RecurringController from "@/modules/recurring/recurring.controller";
import { PrismaRecurringRepository } from "@/modules/recurring/recurring.repository";
import { RecurringService } from "@/modules/recurring/recurring.service";

export function createRecurringModule() {
  const recurringRepository = new PrismaRecurringRepository();
  const recurringService = new RecurringService(recurringRepository);
  const recurringController = new RecurringController(recurringService);
  const authenticate = createAuthenticate();

  return { recurringController, authenticate };
}
