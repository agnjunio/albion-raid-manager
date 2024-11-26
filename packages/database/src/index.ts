import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query"], // Optional: Logs SQL queries in development
});
