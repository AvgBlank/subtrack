import { createAuthenticate } from "@/middleware/authenticate";
import OneTimeController from "@/modules/one-time/one-time.controller";
import { PrismaOneTimeRepository } from "@/modules/one-time/one-time.repository";
import { OneTimeService } from "@/modules/one-time/one-time.service";

export function createOneTimeModule() {
  const oneTimeRepository = new PrismaOneTimeRepository();
  const oneTimeService = new OneTimeService(oneTimeRepository);
  const oneTimeController = new OneTimeController(oneTimeService);
  const authenticate = createAuthenticate();

  return { oneTimeController, authenticate };
}
