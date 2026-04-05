import { CREATED, NOT_FOUND, OK } from "@subtrack/shared/httpStatusCodes";
import {
  createIncomeSchema,
  toggleIncomeSchema,
  updateIncomeSchema,
} from "@subtrack/shared/schemas/income";
import type { RequestHandler } from "express";

import * as incomeServices from "@/income/income.services";
import AppError from "@/shared/utils/AppError";

export const getAll: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const incomes = await incomeServices.getAllIncome(userId);
  res.json(incomes);
};

export const getById: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const income = await incomeServices.getIncomeById(userId, id);
  if (!income) {
    throw new AppError(NOT_FOUND, "Income not found");
  }

  res.json(income);
};

export const create: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const data = createIncomeSchema.parse(req.body);

  const income = await incomeServices.createIncome(userId, data);
  res.status(CREATED).json(income);
};

export const update: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const data = updateIncomeSchema.parse(req.body);

  const income = await incomeServices.updateIncome(userId, id, data);
  if (!income) {
    throw new AppError(NOT_FOUND, "Income not found");
  }

  res.json(income);
};

export const toggleStatus: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const { isActive } = toggleIncomeSchema.parse(req.body);

  const income = await incomeServices.toggleIncomeStatus(userId, id, isActive);
  if (!income) {
    throw new AppError(NOT_FOUND, "Income not found");
  }

  res.json(income);
};

export const remove: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const success = await incomeServices.deleteIncome(userId, id);
  if (!success) {
    throw new AppError(NOT_FOUND, "Income not found");
  }

  res.status(OK).json({ message: "Income deleted" });
};
