import prisma from "@/lib/prisma";
import { DBSession } from "@/modules/auth/types/session.types";

export interface ISessionRepository {
  create(data: DBSession): Promise<{ id: string }>;
}

export class PrismaSessionRepository implements ISessionRepository {
  public async create(data: DBSession) {
    return prisma.session.create({ data, select: { id: true } });
  }
}
