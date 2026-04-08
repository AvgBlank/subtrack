import prisma from "@/lib/prisma";
import {
  DBSession,
  DBSessionId,
  DBSessionWithUser,
} from "@/modules/auth/types/session.types";

export interface ISessionRepository {
  create(data: DBSession): Promise<DBSessionId>;
  getActiveSessionById(id: string): Promise<DBSessionWithUser | null>;
  deleteSessionById(id: string): Promise<void>;
  updateSessionExpiration(id: string, newExpiration: Date): Promise<void>;
  updateSessionLastActiveAt(id: string): Promise<void>;
}

export class PrismaSessionRepository implements ISessionRepository {
  public async create(data: DBSession) {
    return prisma.session.create({ data, select: { id: true } });
  }

  public async getActiveSessionById(id: string) {
    return prisma.session.findUnique({
      where: { id, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
    });
  }

  public async deleteSessionById(id: string) {
    await prisma.session.deleteMany({ where: { id } });
  }

  public async updateSessionExpiration(id: string, newExpiration: Date) {
    await prisma.session.update({
      where: { id },
      data: { expiresAt: newExpiration },
    });
  }

  public async updateSessionLastActiveAt(id: string) {
    await prisma.session.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });
  }
}
