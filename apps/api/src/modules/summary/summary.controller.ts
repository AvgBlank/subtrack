import {
  canISpendSchema,
  recurringSummarySchema,
} from "@subtrack/shared/schemas/summary";
import { RequestHandler } from "express";

import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import { ISummaryService } from "@/modules/summary/summary.service";

class SummaryController {
  public constructor(private summaryService: ISummaryService) {}

  public recurringSummary: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const { year, month } = recurringSummarySchema().parse(req.query);
    const data = await this.summaryService.getRecurringSummary(
      userId,
      month,
      year,
    );
    res.json(data);
  };

  public incomeSummary: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const { year, month } = recurringSummarySchema().parse(req.query);
    const data = await this.summaryService.getIncomeSummary(userId, month, year);
    res.json(data);
  };

  public oneTimeSummary: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const { year, month } = recurringSummarySchema().parse(req.query);
    const data = await this.summaryService.getOneTimeSummary(
      userId,
      month,
      year,
    );
    res.json(data);
  };

  public cashFlowSummary: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const { year, month } = recurringSummarySchema().parse(req.query);
    const data = await this.summaryService.getCashFlowSummary(
      userId,
      month,
      year,
    );
    res.json(data);
  };

  public monthlySummary: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const { year, month } = recurringSummarySchema().parse(req.query);
    const data = await this.summaryService.getMonthlySummary(
      userId,
      month,
      year,
    );
    res.json(data);
  };

  public savingsSummary: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const data = await this.summaryService.getSavingsSummary(userId);
    res.json(data);
  };

  public canISpend: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const { amount } = canISpendSchema.parse(req.query);
    const data = await this.summaryService.getCanISpend(
      userId,
      new Decimal(amount),
    );
    res.json(data);
  };
}

export default SummaryController;
