import type {
  CreateIncomeSchema,
  UpdateIncomeSchema,
} from "@subtrack/shared/schemas/income";

import { IIncomeRepository } from "@/modules/income/income.repository";
import { DBIncome } from "@/modules/income/income.types";

export interface IIncomeService {
  getAll(userId: string): Promise<DBIncome[]>;
  getById(userId: string, id: string): Promise<DBIncome | null>;
  create(userId: string, data: CreateIncomeSchema): Promise<DBIncome>;
  update(
    userId: string,
    id: string,
    data: UpdateIncomeSchema,
  ): Promise<DBIncome | null>;
  toggleStatus(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<DBIncome | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export class IncomeService implements IIncomeService {
  public constructor(private incomeRepository: IIncomeRepository) {}

  public getAll(userId: string) {
    return this.incomeRepository.findAll(userId);
  }

  public getById(userId: string, id: string) {
    return this.incomeRepository.findById(userId, id);
  }

  public create(userId: string, data: CreateIncomeSchema) {
    return this.incomeRepository.create(userId, data);
  }

  public update(userId: string, id: string, data: UpdateIncomeSchema) {
    return this.incomeRepository.update(userId, id, data);
  }

  public toggleStatus(userId: string, id: string, isActive: boolean) {
    return this.incomeRepository.toggleStatus(userId, id, isActive);
  }

  public delete(userId: string, id: string) {
    return this.incomeRepository.delete(userId, id);
  }
}
