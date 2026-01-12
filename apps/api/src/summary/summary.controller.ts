import { RequestHandler } from "express";
import { recurringSummarySchema } from "@subtrack/shared/schemas/summary";
import { getRecurringSummary } from "@/summary/summary.services";

export const recurringSummary: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { year, month } = recurringSummarySchema().parse(req.query);

  const recurringSummary = await getRecurringSummary(userId, month, year);

  res.json(recurringSummary);
};
