// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL!,
// });

// export const prisma = new PrismaClient({ adapter });

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"], // Sirf errors dikhayega build ke waqt
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;