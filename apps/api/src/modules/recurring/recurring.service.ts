import type {
  CreateRecurringSchema,
  UpdateRecurringSchema,
} from "@subtrack/shared/schemas/recurring";

import { IRecurringRepository } from "@/modules/recurring/recurring.repository";
import { DBRecurring } from "@/modules/recurring/recurring.types";

export interface IRecurringService {
  getAll(userId: string): Promise<DBRecurring[]>;
  getById(userId: string, id: string): Promise<DBRecurring | null>;
  create(userId: string, data: CreateRecurringSchema): Promise<DBRecurring>;
  update(
    userId: string,
    id: string,
    data: UpdateRecurringSchema,
  ): Promise<DBRecurring | null>;
  toggleStatus(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<DBRecurring | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export class RecurringService implements IRecurringService {
  public constructor(private recurringRepository: IRecurringRepository) {}

  public getAll(userId: string) {
    return this.recurringRepository.findAll(userId);
  }

  public getById(userId: string, id: string) {
    return this.recurringRepository.findById(userId, id);
  }

  public create(userId: string, data: CreateRecurringSchema) {
    return this.recurringRepository.create(userId, data);
  }

  public update(userId: string, id: string, data: UpdateRecurringSchema) {
    return this.recurringRepository.update(userId, id, data);
  }

  public toggleStatus(userId: string, id: string, isActive: boolean) {
    return this.recurringRepository.toggleStatus(userId, id, isActive);
  }

  public delete(userId: string, id: string) {
    return this.recurringRepository.delete(userId, id);
  }
}
