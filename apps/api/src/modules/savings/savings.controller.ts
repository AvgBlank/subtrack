import { CREATED, NOT_FOUND, OK } from "@subtrack/shared/httpStatusCodes";
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
} from "@subtrack/shared/schemas/savings";
import type { RequestHandler } from "express";

import { ISavingsService } from "@/modules/savings/savings.service";
import AppError from "@/utils/AppError";

class SavingsController {
  public constructor(private savingsService: ISavingsService) {}

  public getAll: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const goals = await this.savingsService.getAll(userId);
    res.json(goals);
  };

  public getById: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const goal = await this.savingsService.getById(userId, id);
    if (!goal) throw new AppError(NOT_FOUND, "Savings goal not found");

    res.json(goal);
  };

  public create: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const data = createSavingsGoalSchema.parse(req.body);

    const goal = await this.savingsService.create(userId, data);
    res.status(CREATED).json(goal);
  };

  public update: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = updateSavingsGoalSchema.parse(req.body);

    const goal = await this.savingsService.update(userId, id, data);
    if (!goal) throw new AppError(NOT_FOUND, "Savings goal not found");

    res.json(goal);
  };

  public remove: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const success = await this.savingsService.delete(userId, id);
    if (!success) throw new AppError(NOT_FOUND, "Savings goal not found");

    res.status(OK).json({ message: "Savings goal deleted" });
  };
}

export default SavingsController;
