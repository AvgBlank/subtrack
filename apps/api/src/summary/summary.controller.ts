import { RequestHandler } from "express";
import { recurringSummarySchema } from "@subtrack/shared/schemas/summary";
import {
  getCashFlowSummary,
  getIncomeSummary,
  getMonthlySummary,
  getOneTimeSummary,
  getRecurringSummary,
} from "@/summary/summary.services";

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
