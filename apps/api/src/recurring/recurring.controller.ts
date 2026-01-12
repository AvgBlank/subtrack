import type { RequestHandler } from "express";
import {
  createRecurringSchema,
  updateRecurringSchema,
  toggleRecurringSchema,
} from "@subtrack/shared/schemas/recurring";
import * as recurringServices from "@/recurring/recurring.services";
import AppError from "@/shared/utils/AppError";
import { CREATED, NOT_FOUND, OK } from "@subtrack/shared/httpStatusCodes";

export const getAll: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const transactions = await recurringServices.getAllRecurring(userId);
  res.json(transactions);
};

export const getById: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const transaction = await recurringServices.getRecurringById(userId, id);
  if (!transaction) {
    throw new AppError(NOT_FOUND, "Recurring transaction not found");
  }

  res.json(transaction);
};

export const create: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const data = createRecurringSchema.parse(req.body);

  const transaction = await recurringServices.createRecurring(userId, data);
  res.status(CREATED).json(transaction);
};

export const update: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const data = updateRecurringSchema.parse(req.body);

  const transaction = await recurringServices.updateRecurring(userId, id, data);
  if (!transaction) {
    throw new AppError(NOT_FOUND, "Recurring transaction not found");
  }

  res.json(transaction);
};

export const toggleStatus: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const { isActive } = toggleRecurringSchema.parse(req.body);

  const transaction = await recurringServices.toggleRecurringStatus(
    userId,
    id,
    isActive,
  );
  if (!transaction) {
    throw new AppError(NOT_FOUND, "Recurring transaction not found");
  }

  res.json(transaction);
};

export const remove: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const success = await recurringServices.deleteRecurring(userId, id);
  if (!success) {
    throw new AppError(NOT_FOUND, "Recurring transaction not found");
  }

  res.status(OK).json({ message: "Recurring transaction deleted" });
};
