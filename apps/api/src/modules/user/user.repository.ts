import prisma from "@/lib/prisma";
import { User } from "@/modules/user/user.types";

export interface UserRepository {
  getByEmail(email: string): Promise<User | null>;
  create(data: {
    name: string;
    email: string;
    password: string | null;
  }): Promise<User>;
}

export class PrismaUserRepository implements UserRepository {
  public async getByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
      },
    });
    return user;
  }

  public async create(data: {
    name: string;
    email: string;
    password: string | null;
  }) {
    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
      },
    });
    return user;
  }
}
