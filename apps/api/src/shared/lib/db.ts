import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { DATABASE_URL } from "@/shared/constants/env";

const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
const prisma = new PrismaClient({ adapter });
export default prisma;
