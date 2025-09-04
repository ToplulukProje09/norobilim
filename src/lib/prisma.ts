// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Hot-reload sırasında duplicate prisma client oluşmasını engeller
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
