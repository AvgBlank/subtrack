import prisma from "@/lib/prisma";
import { Session } from "@/modules/auth/types/session.types";

export interface SessionRepository {
  create(data: Session): Promise<{ id: string }>;
}

export class PrismaSessionRepository implements SessionRepository {
  public async create(data: Session) {
    return prisma.session.create({ data, select: { id: true } });
  }
}
