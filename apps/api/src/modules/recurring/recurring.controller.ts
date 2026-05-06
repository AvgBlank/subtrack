import { CREATED, NOT_FOUND, OK } from "@subtrack/shared/httpStatusCodes";
import {
  createRecurringSchema,
  toggleRecurringSchema,
  updateRecurringSchema,
} from "@subtrack/shared/schemas/recurring";
import type { RequestHandler } from "express";

import { IRecurringService } from "@/modules/recurring/recurring.service";
import AppError from "@/utils/AppError";

class RecurringController {
  public constructor(private recurringService: IRecurringService) {}

  public getAll: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const transactions = await this.recurringService.getAll(userId);
    res.json(transactions);
  };

  public getById: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const transaction = await this.recurringService.getById(userId, id);
    if (!transaction)
      throw new AppError(NOT_FOUND, "Recurring transaction not found");

    res.json(transaction);
  };

  public create: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const data = createRecurringSchema.parse(req.body);

    const transaction = await this.recurringService.create(userId, data);
    res.status(CREATED).json(transaction);
  };

  public update: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = updateRecurringSchema.parse(req.body);

    const transaction = await this.recurringService.update(userId, id, data);
    if (!transaction)
      throw new AppError(NOT_FOUND, "Recurring transaction not found");

    res.json(transaction);
  };

  public toggleStatus: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { isActive } = toggleRecurringSchema.parse(req.body);

    const transaction = await this.recurringService.toggleStatus(
      userId,
      id,
      isActive,
    );
    if (!transaction)
      throw new AppError(NOT_FOUND, "Recurring transaction not found");

    res.json(transaction);
  };

  public remove: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const success = await this.recurringService.delete(userId, id);
    if (!success)
      throw new AppError(NOT_FOUND, "Recurring transaction not found");

    res.status(OK).json({ message: "Recurring transaction deleted" });
  };
}

export default RecurringController;
