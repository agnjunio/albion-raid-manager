import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Optional: Logs SQL queries in development
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
