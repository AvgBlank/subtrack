import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { DATABASE_URL } from "@/shared/constants/env";

class Prisma {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!this.instance) {
      const adapter = new PrismaPg({
        connectionString: DATABASE_URL,
        connectionTimeoutMillis: 5000,
      });
      this.instance = new PrismaClient({ adapter });
    }
    return this.instance;
  }
}
const prisma = Prisma.getInstance();
export default prisma;
