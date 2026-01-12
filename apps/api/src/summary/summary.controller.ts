import { RequestHandler } from "express";
import {
  canISpendSchema,
  recurringSummarySchema,
} from "@subtrack/shared/schemas/summary";
import {
  getCanISpend,
  getCashFlowSummary,
  getIncomeSummary,
  getMonthlySummary,
  getOneTimeSummary,
  getRecurringSummary,
  getSavingsSummary,
} from "@/summary/summary.services";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";

export const recurringSummary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { year, month } = recurringSummarySchema().parse(req.query);

  const recurringSummary = await getRecurringSummary(userId, month, year);

  res.json(recurringSummary);
};

export const incomeSummary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { year, month } = recurringSummarySchema().parse(req.query);

  const recurringSummary = await getIncomeSummary(userId, month, year);

  res.json(recurringSummary);
};

export const oneTimeSummary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { year, month } = recurringSummarySchema().parse(req.query);

  const recurringSummary = await getOneTimeSummary(userId, month, year);

  res.json(recurringSummary);
};

export const cashFlowSummary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { year, month } = recurringSummarySchema().parse(req.query);

  const recurringSummary = await getCashFlowSummary(userId, month, year);

  res.json(recurringSummary);
};

export const monthlySummary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { year, month } = recurringSummarySchema().parse(req.query);

  const recurringSummary = await getMonthlySummary(userId, month, year);

  res.json(recurringSummary);
};

export const savingsSummary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const savingsGoalSummary = await getSavingsSummary(userId);

  res.json(savingsGoalSummary);
};

export const canISpend: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { amount } = canISpendSchema.parse(req.query);

  const canISpendResult = await getCanISpend(userId, new Decimal(amount));

  res.json(canISpendResult);
};
