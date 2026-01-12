import type { RequestHandler } from "express";
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
} from "@subtrack/shared/schemas/savings";
import * as savingsServices from "@/savings/savings.services";
import AppError from "@/shared/utils/AppError";
import { CREATED, NOT_FOUND, OK } from "@subtrack/shared/httpStatusCodes";

export const getAll: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const goals = await savingsServices.getAllSavingsGoals(userId);
  res.json(goals);
};

export const getById: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const goal = await savingsServices.getSavingsGoalById(userId, id);
  if (!goal) {
    throw new AppError(NOT_FOUND, "Savings goal not found");
  }

  res.json(goal);
};

export const create: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const data = createSavingsGoalSchema.parse(req.body);

  const goal = await savingsServices.createSavingsGoal(userId, data);
  res.status(CREATED).json(goal);
};

export const update: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const data = updateSavingsGoalSchema.parse(req.body);

  const goal = await savingsServices.updateSavingsGoal(userId, id, data);
  if (!goal) {
    throw new AppError(NOT_FOUND, "Savings goal not found");
  }

  res.json(goal);
};

export const remove: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const success = await savingsServices.deleteSavingsGoal(userId, id);
  if (!success) {
    throw new AppError(NOT_FOUND, "Savings goal not found");
  }

  res.status(OK).json({ message: "Savings goal deleted" });
};
