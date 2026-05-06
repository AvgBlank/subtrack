import {
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  OK,
} from "@subtrack/shared/httpStatusCodes";
import {
  createOneTimeSchema,
  updateOneTimeSchema,
} from "@subtrack/shared/schemas/one-time";
import type { RequestHandler } from "express";

import { IOneTimeService } from "@/modules/one-time/one-time.service";
import AppError from "@/utils/AppError";

class OneTimeController {
  public constructor(private oneTimeService: IOneTimeService) {}

  public getByMonth: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      throw new AppError(BAD_REQUEST, "Invalid month or year");
    }

    const transactions = await this.oneTimeService.getByMonth(
      userId,
      month,
      year,
    );
    res.json(transactions);
  };

  public getById: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const transaction = await this.oneTimeService.getById(userId, id);
    if (!transaction)
      throw new AppError(NOT_FOUND, "One-time transaction not found");

    res.json(transaction);
  };

  public create: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const data = createOneTimeSchema.parse(req.body);

    const transaction = await this.oneTimeService.create(userId, data);
    res.status(CREATED).json(transaction);
  };

  public update: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = updateOneTimeSchema.parse(req.body);

    const transaction = await this.oneTimeService.update(userId, id, data);
    if (!transaction)
      throw new AppError(NOT_FOUND, "One-time transaction not found");

    res.json(transaction);
  };

  public remove: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const success = await this.oneTimeService.delete(userId, id);
    if (!success)
      throw new AppError(NOT_FOUND, "One-time transaction not found");

    res.status(OK).json({ message: "One-time transaction deleted" });
  };
}

export default OneTimeController;
