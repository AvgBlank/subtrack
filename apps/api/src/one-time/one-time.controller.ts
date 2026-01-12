import type { RequestHandler } from "express";
import {
  createOneTimeSchema,
  updateOneTimeSchema,
} from "@subtrack/shared/schemas/one-time";
import * as oneTimeServices from "@/one-time/one-time.services";
import AppError from "@/shared/utils/AppError";
import { CREATED, NOT_FOUND, OK, BAD_REQUEST } from "@subtrack/shared/httpStatusCodes";

export const getByMonth: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const month = parseInt(req.query.month as string);
  const year = parseInt(req.query.year as string);

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    throw new AppError(BAD_REQUEST, "Invalid month or year");
  }

  const transactions = await oneTimeServices.getOneTimeByMonth(userId, month, year);
  res.json(transactions);
};

export const getById: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const transaction = await oneTimeServices.getOneTimeById(userId, id);
  if (!transaction) {
    throw new AppError(NOT_FOUND, "One-time transaction not found");
  }

  res.json(transaction);
};

export const create: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const data = createOneTimeSchema.parse(req.body);

  const transaction = await oneTimeServices.createOneTime(userId, data);
  res.status(CREATED).json(transaction);
};

export const update: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const data = updateOneTimeSchema.parse(req.body);

  const transaction = await oneTimeServices.updateOneTime(userId, id, data);
  if (!transaction) {
    throw new AppError(NOT_FOUND, "One-time transaction not found");
  }

  res.json(transaction);
};

export const remove: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const success = await oneTimeServices.deleteOneTime(userId, id);
  if (!success) {
    throw new AppError(NOT_FOUND, "One-time transaction not found");
  }

  res.status(OK).json({ message: "One-time transaction deleted" });
};
