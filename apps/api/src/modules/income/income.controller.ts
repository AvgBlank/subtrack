import { CREATED, NOT_FOUND, OK } from "@subtrack/shared/httpStatusCodes";
import {
  createIncomeSchema,
  toggleIncomeSchema,
  updateIncomeSchema,
} from "@subtrack/shared/schemas/income";
import type { RequestHandler } from "express";

import { IIncomeService } from "@/modules/income/income.service";
import AppError from "@/utils/AppError";

class IncomeController {
  public constructor(private incomeService: IIncomeService) {}

  public getAll: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const incomes = await this.incomeService.getAll(userId);
    res.json(incomes);
  };

  public getById: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const income = await this.incomeService.getById(userId, id);
    if (!income) throw new AppError(NOT_FOUND, "Income not found");

    res.json(income);
  };

  public create: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const data = createIncomeSchema.parse(req.body);

    const income = await this.incomeService.create(userId, data);
    res.status(CREATED).json(income);
  };

  public update: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = updateIncomeSchema.parse(req.body);

    const income = await this.incomeService.update(userId, id, data);
    if (!income) throw new AppError(NOT_FOUND, "Income not found");

    res.json(income);
  };

  public toggleStatus: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { isActive } = toggleIncomeSchema.parse(req.body);

    const income = await this.incomeService.toggleStatus(userId, id, isActive);
    if (!income) throw new AppError(NOT_FOUND, "Income not found");

    res.json(income);
  };

  public remove: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const success = await this.incomeService.delete(userId, id);
    if (!success) throw new AppError(NOT_FOUND, "Income not found");

    res.status(OK).json({ message: "Income deleted" });
  };
}

export default IncomeController;
