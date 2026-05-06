import type {
  CreateOneTimeSchema,
  UpdateOneTimeSchema,
} from "@subtrack/shared/schemas/one-time";

import { IOneTimeRepository } from "@/modules/one-time/one-time.repository";
import { DBOneTime } from "@/modules/one-time/one-time.types";

export interface IOneTimeService {
  getByMonth(userId: string, month: number, year: number): Promise<DBOneTime[]>;
  getById(userId: string, id: string): Promise<DBOneTime | null>;
  create(userId: string, data: CreateOneTimeSchema): Promise<DBOneTime>;
  update(
    userId: string,
    id: string,
    data: UpdateOneTimeSchema,
  ): Promise<DBOneTime | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export class OneTimeService implements IOneTimeService {
  public constructor(private oneTimeRepository: IOneTimeRepository) {}

  public getByMonth(userId: string, month: number, year: number) {
    return this.oneTimeRepository.findByMonth(userId, month, year);
  }

  public getById(userId: string, id: string) {
    return this.oneTimeRepository.findById(userId, id);
  }

  public create(userId: string, data: CreateOneTimeSchema) {
    return this.oneTimeRepository.create(userId, data);
  }

  public update(userId: string, id: string, data: UpdateOneTimeSchema) {
    return this.oneTimeRepository.update(userId, id, data);
  }

  public delete(userId: string, id: string) {
    return this.oneTimeRepository.delete(userId, id);
  }
}
