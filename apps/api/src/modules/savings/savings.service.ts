import type {
  CreateSavingsGoalSchema,
  UpdateSavingsGoalSchema,
} from "@subtrack/shared/schemas/savings";

import { ISavingsRepository } from "@/modules/savings/savings.repository";
import { DBSavingsGoal } from "@/modules/savings/savings.types";

export interface ISavingsService {
  getAll(userId: string): Promise<DBSavingsGoal[]>;
  getById(userId: string, id: string): Promise<DBSavingsGoal | null>;
  create(
    userId: string,
    data: CreateSavingsGoalSchema,
  ): Promise<DBSavingsGoal>;
  update(
    userId: string,
    id: string,
    data: UpdateSavingsGoalSchema,
  ): Promise<DBSavingsGoal | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export class SavingsService implements ISavingsService {
  public constructor(private savingsRepository: ISavingsRepository) {}

  public getAll(userId: string) {
    return this.savingsRepository.findAll(userId);
  }

  public getById(userId: string, id: string) {
    return this.savingsRepository.findById(userId, id);
  }

  public create(userId: string, data: CreateSavingsGoalSchema) {
    return this.savingsRepository.create(userId, data);
  }

  public update(userId: string, id: string, data: UpdateSavingsGoalSchema) {
    return this.savingsRepository.update(userId, id, data);
  }

  public delete(userId: string, id: string) {
    return this.savingsRepository.delete(userId, id);
  }
}
